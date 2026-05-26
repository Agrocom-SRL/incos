import { ForbiddenError, NotFoundError } from '../../../domain/errors/AppError.js';
import { parsePoliticaFromRow } from '../../utils/politicaInstitucionalPayload.js';
import { calcularNotaBimestre, calcularNotaFinalGestion } from '../../utils/cuadernoNotasCalculo.js';
import { obtenerCuotasDesdePolitica } from '../../utils/obtenerCuotasDesdePolitica.js';

const BIMESTRES_TOTAL = 4;

const redondear = (v) => (v == null ? null : Math.round(Number(v) * 100) / 100);

const formatearFecha = (v) => {
  if (v == null || v === '') return null;
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const agruparEstudiantes = (filas, notaMinima, pesosBimestres) => {
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
    const habTeorico = redondear(row.habilitacion_teorico);
    const habPractico = redondear(row.habilitacion_practico);

    const teoEfectivo = habTeorico ?? teoricoCuota;
    const praEfectivo = habPractico ?? practicoCuota;
    const sumaCalculada = calcularNotaBimestre(teoricoCuota, practicoCuota);
    const suma =
      notaBimestre != null
        ? notaBimestre
        : calcularNotaBimestre(teoEfectivo, praEfectivo);
    const tieneAjusteAdmin = habTeorico != null || habPractico != null;

    est.bimestresPorNumero.set(num, {
      numero: num,
      teorico: teoEfectivo ?? teoricoCuota,
      practico: praEfectivo ?? practicoCuota,
      suma,
      sumaCalculada,
      tieneAjusteAdmin,
      fechaHabilitacion: formatearFecha(row.fecha_habilitacion),
      estado: row.estado_bimestre ?? null,
    });
  }

  const lista = [...map.values()];
  lista.sort((a, b) =>
    String(a.nombre ?? '').localeCompare(String(b.nombre ?? ''), 'es', { sensitivity: 'base' }),
  );

  return lista.map((est, index) => {
    const bimestres = Array.from({ length: BIMESTRES_TOTAL }, (_, i) => {
      const numero = i + 1;
      return (
        est.bimestresPorNumero.get(numero) ?? {
          numero,
          teorico: null,
          practico: null,
          suma: null,
          sumaCalculada: null,
          tieneAjusteAdmin: false,
          fechaHabilitacion: null,
          estado: null,
        }
      );
    });

    const { notaFinal, gestionCompleta } = calcularNotaFinalGestion(
      bimestres.map((b) => ({ numero: b.numero, nota: b.suma })),
      pesosBimestres,
    );
    const observacion =
      gestionCompleta && notaFinal != null
        ? notaFinal >= notaMinima
          ? 'APROBADO'
          : 'REPROBADO'
        : null;
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
    calificacionContextoRepository,
    calificacionCoordinacionRepository,
    teacherRepository,
    evaluationConfigurationRepository,
    authRepository,
    logger,
  }) {
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.teacherRepository = teacherRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
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

    const cursoRow =
      await this.calificacionCoordinacionRepository.obtenerCursoPorAsignacion(asignacionIdNum);
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

    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();
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
    const { pesosBimestres } = obtenerCuotasDesdePolitica(politicaParsed);

    const [docenteRow, filasEstudiantes, periodosCalendario] = await Promise.all([
      this.calificacionCoordinacionRepository.obtenerDocenteCalificaciones(docenteIdAsignacion),
      this.calificacionCoordinacionRepository.listarEstudiantesRegistroNotas(asignacionIdNum),
      this.calificacionContextoRepository.obtenerPeriodosBimestresGestion(ctx.gestion_id),
    ]);

    const estudiantes = agruparEstudiantes(filasEstudiantes, notaMinimaAprobacion, pesosBimestres);

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
        pesosBimestres,
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
