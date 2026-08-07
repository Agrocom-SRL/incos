import { ForbiddenError, NotFoundError } from '../../../domain/errors/AppError.js';
import { parsePoliticaFromRow } from '../../utils/politicaInstitucionalPayload.js';
import { tryResolveDocenteIdForUsuario } from '../../utils/resolveDocenteIdForUsuario.js';
import {
  calcularNotaBimestre,
  calcularNotaFinalGestion
} from '../../utils/cuadernoNotasCalculo.js';
import { obtenerCuotasDesdePolitica } from '../../utils/obtenerCuotasDesdePolitica.js';
import { sincronizarNotasAsistenciaBimestre } from '../../utils/sincronizarNotasAsistenciaBimestre.js';
import { calcularVeredictoMateria } from './libros/helpers/folioCeldasHelper.js';
import { ESTADOS_ACADEMICOS_FOLIO } from '../../../domain/constants/libros.constants.js';

const BIMESTRES_TOTAL = 4;

const redondear = (v) => (v == null ? null : Math.round(Number(v) * 100) / 100);

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
        estadoMateria: row.estado_materia ?? null,
        recuperatorio: null,
        bimestresPorNumero: new Map()
      });
    }
    const est = map.get(id);
    const num = Number(row.bimestre);
    if (Number.isFinite(num) && num >= 1 && num <= 4) {
      const teorico = redondear(row.nota_teorico);
      const practico = redondear(row.nota_practico);
      const notaBimestre = redondear(row.nota_bimestre);

      const suma = notaBimestre != null ? notaBimestre : calcularNotaBimestre(teorico, practico);

      est.bimestresPorNumero.set(num, {
        numero: num,
        teorico,
        practico,
        suma,
        estado: row.estado_bimestre ?? null
      });
    }
  }

  const lista = [...map.values()];
  lista.sort((a, b) =>
    String(a.nombre ?? '').localeCompare(String(b.nombre ?? ''), 'es', { sensitivity: 'base' })
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
          estado: null
        }
      );
    });

    // gestionCompleta (¿están los 4 bimestres cargados?) sigue viniendo de
    // calcularNotaFinalGestion — eso no cambia. El veredicto YA NO se
    // recalcula aquí: notaFinal es el caché real (est.notaFinal, ya leído de
    // matriculas_materia.nota_final) y observacion sale de
    // calcularVeredictoMateria (misma función que usan Centralizador y el
    // folio del Libro), para que las tres pantallas coincidan siempre.
    const { gestionCompleta } = calcularNotaFinalGestion(
      bimestres.map((b) => ({ numero: b.numero, nota: b.suma })),
      pesosBimestres
    );
    let observacion = null;
    if (gestionCompleta) {
      const veredicto = calcularVeredictoMateria(
        { nota_final: est.notaFinal, estado: est.estadoMateria },
        notaMinima
      );
      observacion =
        veredicto === ESTADOS_ACADEMICOS_FOLIO.APROBADO ||
        veredicto === ESTADOS_ACADEMICOS_FOLIO.REPROBADO
          ? veredicto
          : null;
    }
    return {
      nro: index + 1,
      id: est.id,
      codigo: est.codigo,
      cedula: est.cedula,
      nombre: est.nombre,
      bimestres,
      notaFinal: est.notaFinal,
      recuperatorio: est.recuperatorio,
      observacion
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
    cuadernoRepository,
    subjectEnrollmentBimesterRepository,
    bimesterEvaluationGradeRepository,
    asistenciaPlanillaViewRepository,
    teacherRepository,
    userRepository,
    evaluationConfigurationRepository,
    authRepository,
    logger
  }) {
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.subjectEnrollmentBimesterRepository = subjectEnrollmentBimesterRepository;
    this.bimesterEvaluationGradeRepository = bimesterEvaluationGradeRepository;
    this.asistenciaPlanillaViewRepository = asistenciaPlanillaViewRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
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
    const docenteSesion = await tryResolveDocenteIdForUsuario({
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      usuarioId
    });
    const esDocenteDelCurso =
      Number.isFinite(docenteSesion) && docenteSesion === docenteIdAsignacion;

    if (!esDocenteDelCurso) {
      const esCoordinacion = await this.authRepository.tienePermiso(
        usuarioId,
        'academico.calificacion.coordinacion',
        'LISTAR'
      );
      if (!esCoordinacion) {
        throw new ForbiddenError('No tiene acceso a este curso.');
      }
    }

    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();
    if (!ctx?.gestion_id) {
      const err = new Error('No hay gestión académica vigente configurada');
      err.statusCode = 404;
      throw err;
    }

    const politicaRow = await this.evaluationConfigurationRepository.findActiveRowByGestionId(
      ctx.gestion_id
    );
    const politicaParsed = parsePoliticaFromRow(politicaRow) ?? {};
    const notaMinimaAprobacion = Number(politicaParsed.notaMinimaAprobacion) || 61;
    const { pesosBimestres } = obtenerCuotasDesdePolitica(politicaParsed);

    // Recalcular la(s) columna(s) ASISTENCIA de cada bimestre ANTES de leer el
    // consolidado, para que el registro refleje la asistencia actual sin esperar al
    // cierre. Side-effect tolerante a fallos con guard de estado por bimestre: los
    // bimestres CERRADOS/PENDIENTES son no-op (no se pisan notas consolidadas) y los
    // cursos sin columna ASISTENCIA también (no-op barato en el helper).
    for (let bimestreNumero = 1; bimestreNumero <= BIMESTRES_TOTAL; bimestreNumero += 1) {
      // eslint-disable-next-line no-await-in-loop
      await sincronizarNotasAsistenciaBimestre({
        calificacionContextoRepository: this.calificacionContextoRepository,
        cuadernoRepository: this.cuadernoRepository,
        asistenciaPlanillaViewRepository: this.asistenciaPlanillaViewRepository,
        subjectEnrollmentBimesterRepository: this.subjectEnrollmentBimesterRepository,
        bimesterEvaluationGradeRepository: this.bimesterEvaluationGradeRepository,
        asignacionId: asignacionIdNum,
        gestionId: ctx.gestion_id,
        bimestreNumero,
        usuarioId,
        logger: this.logger
      });
    }

    const [docenteRow, filasEstudiantes, periodosCalendario] = await Promise.all([
      this.calificacionCoordinacionRepository.obtenerDocenteCalificaciones(docenteIdAsignacion),
      this.calificacionCoordinacionRepository.listarEstudiantesRegistroNotas(asignacionIdNum),
      this.calificacionContextoRepository.obtenerPeriodosBimestresGestion(ctx.gestion_id)
    ]);

    const estudiantes = agruparEstudiantes(filasEstudiantes, notaMinimaAprobacion, pesosBimestres);

    // Bimestres REABIERTO por curso (misma señal que GET cuaderno / assertBimestreEditable).
    const bimestresReabiertos = new Set();
    const bimesterRepo = this.subjectEnrollmentBimesterRepository;
    for (let numero = 1; numero <= BIMESTRES_TOTAL; numero += 1) {
      // eslint-disable-next-line no-await-in-loop
      const reabiertos = await bimesterRepo.contarBimestreReabiertoCurso(asignacionIdNum, numero);
      if (reabiertos > 0) {
        bimestresReabiertos.add(numero);
      }
    }

    const bimestreVigente = Number(ctx.bimestre_vigente) || null;
    const periodosPorNumero = new Map(
      (periodosCalendario ?? []).map((p) => [Number(p.numero_orden), p])
    );
    const bimestresCalendario = Array.from({ length: BIMESTRES_TOTAL }, (_, i) => {
      const numero = i + 1;
      const p = periodosPorNumero.get(numero);
      const tipo = p?.estado_calendario ?? 'futuro';
      const reabierto = bimestresReabiertos.has(numero);
      return {
        numero,
        nombre: p?.nombre ?? null,
        fechaInicio: p?.fecha_inicio ?? null,
        fechaFin: p?.fecha_fin ?? null,
        estadoCalendario: tipo,
        reabierto,
        editable: reabierto || (tipo === 'abierto' && numero <= (bimestreVigente ?? numero))
      };
    });

    this.logger.info('[Calificaciones] Registro de notas', {
      asignacionId: asignacionIdNum,
      estudiantes: estudiantes.length
    });

    let gestionVigente = null;
    if (ctx.gestion_nombre != null) {
      gestionVigente = String(ctx.gestion_nombre);
    } else if (ctx.gestion_anio != null) {
      gestionVigente = String(ctx.gestion_anio);
    }

    return {
      docente: {
        id: docenteRow?.docente_id ?? docenteIdAsignacion,
        nombre: docenteRow?.docente_nombre ?? '',
        gestionVigente,
        bimestreVigente,
        bimestreNombre: ctx.bimestre_nombre ?? null,
        notaMinimaAprobacion,
        pesosBimestres
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
        estudiantes: Number(cursoRow.cantidad_estudiantes ?? estudiantes.length)
      },
      estudiantes,
      bimestresCalendario,
      gestion: {
        fechaInicio: ctx.gestion_fecha_inicio ?? null,
        fechaFin: ctx.gestion_fecha_fin ?? null
      }
    };
  }
}
