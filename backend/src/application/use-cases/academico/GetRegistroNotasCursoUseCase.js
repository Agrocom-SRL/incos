import { ForbiddenError, NotFoundError } from '../../../domain/errors/AppError.js';
import { parsePoliticaFromRow } from '../../utils/politicaInstitucionalPayload.js';
import {
  calcularNotaBimestre,
  notaCuotaAPromedio100,
} from '../../utils/cuadernoNotasCalculo.js';
import { obtenerCuotasCursoDesdeAjustes } from '../../utils/obtenerCuotasCursoDesdeAjustes.js';

const BIMESTRES_TOTAL = 4;

const redondear = (v) => (v == null ? null : Math.round(Number(v) * 100) / 100);

const agruparEstudiantes = (filas, notaMinima, cuotas) => {
  const { cuotaTeorico, cuotaPractico } = cuotas;
  const map = new Map();
  for (const row of filas) {
    const id = Number(row.estudiante_id);
    if (!map.has(id)) {
      map.set(id, {
        id,
        codigo: row.codigo_estudiante ?? '',
        cedula: row.cedula ?? '',
        nombre: row.nombre_completo ?? '',
        matriculaMateriaId: row.matricula_materia_id,
        notaFinal: redondear(row.nota_final),
        recuperatorio: null,
        bimestresPorNumero: new Map(),
      });
    }
    const est = map.get(id);
    const num = Number(row.bimestre);
    if (!Number.isFinite(num) || num < 1 || num > 4) continue;

    const teoricoCuota = redondear(row.nota_teorico);
    const practicoCuota = redondear(row.nota_practico);
    const notaBimestre = redondear(row.nota_bimestre);
    const notaHabilitacion = redondear(row.nota_habilitacion);

    const suma =
      notaHabilitacion != null
        ? notaHabilitacion
        : notaBimestre != null
          ? notaBimestre
          : calcularNotaBimestre(teoricoCuota, practicoCuota);

    est.bimestresPorNumero.set(num, {
      numero: num,
      teorico: notaCuotaAPromedio100(teoricoCuota, cuotaTeorico),
      practico: notaCuotaAPromedio100(practicoCuota, cuotaPractico),
      suma,
      estado: row.estado_bimestre ?? null,
    });
  }

  return [...map.values()].map((est, index) => {
    const bimestres = Array.from({ length: BIMESTRES_TOTAL }, (_, i) => {
      const numero = i + 1;
      return (
        est.bimestresPorNumero.get(numero) ?? {
          numero,
          teorico: null,
          practico: null,
          suma: null,
          estado: null,
        }
      );
    });
    const notaFinal = est.notaFinal;
    const observacion =
      notaFinal == null
        ? null
        : notaFinal >= notaMinima
          ? 'APROBADO'
          : 'REPROBADO';
    return {
      nro: index + 1,
      id: est.id,
      codigo: est.codigo,
      cedula: est.cedula,
      nombre: est.nombre,
      bimestres,
      notaFinal,
      recuperatorio: est.recuperatorio,
      observacion,
    };
  });
};

/**
 * Registro académico de notas (consolidado) por asignación docente.
 */
export class GetRegistroNotasCursoUseCase {
  constructor({
    calificacionRepository,
    teacherRepository,
    evaluationConfigurationRepository,
    ajustesCursoRepository,
    authRepository,
    logger,
  }) {
    this.calificacionRepository = calificacionRepository;
    this.teacherRepository = teacherRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
    this.ajustesCursoRepository = ajustesCursoRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number, asignacionId: number }} input
   */
  async execute({ usuarioId, asignacionId }) {
    const asignacionIdNum = Number(asignacionId);
    if (!Number.isFinite(asignacionIdNum) || asignacionIdNum < 1) {
      throw new NotFoundError('Asignación');
    }

    const cursoRow = await this.calificacionRepository.obtenerCursoPorAsignacion(asignacionIdNum);
    if (!cursoRow) {
      throw new NotFoundError('Curso');
    }

    const docenteIdAsignacion = Number(cursoRow.docente_id);
    const teachers = await this.teacherRepository.findAll({ userId: usuarioId });
    const teacher = teachers?.[0] ?? null;
    const plain = teacher?.toPlainObject?.() ?? teacher;
    const docenteSesion = Number(plain?.id ?? plain?.docenteId);
    const esDocenteDelCurso =
      Number.isFinite(docenteSesion) && docenteSesion === docenteIdAsignacion;

    if (!esDocenteDelCurso) {
      const esCoordinacion = await this.authRepository.tienePermiso(
        usuarioId,
        'academico.calificacion.coordinacion',
        'LISTAR',
      );
      if (!esCoordinacion) {
        throw new ForbiddenError('No tenés acceso a este curso.');
      }
    }

    const ctx = await this.calificacionRepository.obtenerContextoVigente();
    if (!ctx?.gestion_id) {
      const err = new Error('No hay gestión académica vigente configurada');
      err.statusCode = 404;
      throw err;
    }

    const politicaRow = await this.evaluationConfigurationRepository.findActiveRowByGestionId(
      ctx.gestion_id,
    );
    const politicaParsed = parsePoliticaFromRow(politicaRow) ?? {};
    const notaMinimaAprobacion = Number(politicaParsed.notaMinimaAprobacion) || 61;

    const ajustes = await this.ajustesCursoRepository.obtenerAjustes(asignacionIdNum);
    const cuotas = obtenerCuotasCursoDesdeAjustes(ajustes);

    const [docenteRow, filasEstudiantes, periodosCalendario] = await Promise.all([
      this.calificacionRepository.obtenerDocenteCalificaciones(docenteIdAsignacion),
      this.calificacionRepository.listarEstudiantesRegistroNotas(asignacionIdNum),
      this.calificacionRepository.obtenerPeriodosBimestresGestion(ctx.gestion_id),
    ]);

    const estudiantes = agruparEstudiantes(filasEstudiantes, notaMinimaAprobacion, cuotas);

    const bimestreVigente = Number(ctx.bimestre_vigente) || null;
    const periodosPorNumero = new Map(
      (periodosCalendario ?? []).map((p) => [Number(p.numero_orden), p]),
    );
    const bimestresCalendario = Array.from({ length: BIMESTRES_TOTAL }, (_, i) => {
      const numero = i + 1;
      const p = periodosPorNumero.get(numero);
      const tipo = p?.estado_calendario ?? 'futuro';
      return {
        numero,
        estadoCalendario: tipo,
        editable: tipo === 'abierto' && numero <= (bimestreVigente ?? numero),
      };
    });

    this.logger.info('[Calificaciones] Registro de notas', {
      asignacionId: asignacionIdNum,
      estudiantes: estudiantes.length,
    });

    return {
      docente: {
        id: docenteRow?.docente_id ?? docenteIdAsignacion,
        nombre: docenteRow?.docente_nombre ?? '',
        gestionVigente:
          ctx.gestion_nombre != null
            ? String(ctx.gestion_nombre)
            : ctx.gestion_anio != null
              ? String(ctx.gestion_anio)
              : null,
        bimestreVigente,
        bimestreNombre: ctx.bimestre_nombre ?? null,
        notaMinimaAprobacion,
      },
      curso: {
        id: asignacionIdNum,
        materia: cursoRow.materia_nombre ?? '',
        materiaSigla: cursoRow.materia_sigla ?? null,
        carrera: cursoRow.carrera_nombre ?? '',
        carreraColor: cursoRow.carrera_color_hex ?? '#64748b',
        periodo: cursoRow.asignatura_periodo_nombre ?? null,
        paralelo: cursoRow.paralelo_nombre ?? '',
        turno: cursoRow.paralelo_turno ?? '',
        estudiantes: Number(cursoRow.cantidad_estudiantes ?? estudiantes.length),
      },
      estudiantes,
      bimestresCalendario,
    };
  }
}
