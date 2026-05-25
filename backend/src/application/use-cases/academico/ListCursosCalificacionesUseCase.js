import { ForbiddenError, NotFoundError } from '../../../domain/errors/AppError.js';
import { parsePoliticaFromRow } from '../../utils/politicaInstitucionalPayload.js';

const BIMESTRES_TOTAL = 4;

const ETIQUETA_ESTADO_BIMESTRE = {
  abierto: 'Abierto',
  cerrado: 'Cerrado',
  futuro: 'Futuro',
};

const buildPeriodosCalendarioMap = (filas) => {
  const map = new Map();
  for (const row of filas ?? []) {
    const numero = Number(row.numero_orden);
    if (!Number.isFinite(numero)) continue;
    const tipo = String(row.estado_calendario ?? 'futuro');
    map.set(numero, {
      nombre: row.nombre ?? null,
      tipo,
      etiqueta: ETIQUETA_ESTADO_BIMESTRE[tipo] ?? 'Futuro',
    });
  }
  return map;
};

const mapEstadoBimestreCalendario = (numero, periodosMap) => {
  const p = periodosMap.get(numero);
  if (!p) {
    return { tipo: 'futuro', etiqueta: 'Futuro', nombrePeriodo: null };
  }
  return {
    tipo: p.tipo,
    etiqueta: p.etiqueta,
    nombrePeriodo: p.nombre,
  };
};

const agruparResumenBimestres = (filas) => {
  const porAsignacion = new Map();
  for (const row of filas) {
    const id = Number(row.asignacion_docente_id);
    if (!porAsignacion.has(id)) porAsignacion.set(id, new Map());
    porAsignacion.get(id).set(Number(row.bimestre), row);
  }
  return porAsignacion;
};

const armarBimestresCurso = (asignacionId, resumenMap, periodosMap, estudiantes) => {
  const porBimestre = resumenMap.get(asignacionId) ?? new Map();
  const numeros = periodosMap.size
    ? [...periodosMap.keys()].sort((a, b) => a - b)
    : Array.from({ length: BIMESTRES_TOTAL }, (_, i) => i + 1);

  return numeros.map((numero) => {
    const row = porBimestre.get(numero);
    const matriculas = Number(row?.matriculas ?? estudiantes) || 0;
    const aprobados = Number(row?.aprobados ?? 0);
    const reprobados = Number(row?.reprobados ?? 0);
    const evaluaciones = Number(row?.evaluaciones ?? 0);
    const conNota = aprobados + reprobados;
    const estado = mapEstadoBimestreCalendario(numero, periodosMap);
    const progreso =
      matriculas > 0 ? Math.min(100, Math.round((conNota / matriculas) * 100)) : 0;

    return {
      numero,
      estado,
      evaluaciones,
      aprobados,
      reprobados,
      progreso,
    };
  });
};

/**
 * Cursos del docente para Mis cursos / vista coordinación (gestión vigente).
 */
export class ListCursosCalificacionesUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../infrastructure/repositories/CalificacionRepository.js').CalificacionRepository} deps.calificacionRepository
   * @param {import('../../infrastructure/repositories/TeacherRepository.js').TeacherRepository} deps.teacherRepository
   * @param {import('../../infrastructure/repositories/EvaluationConfigurationRepository.js').EvaluationConfigurationRepository} deps.evaluationConfigurationRepository
   * @param {Object} deps.logger
   */
  constructor({
    calificacionContextoRepository,
    calificacionCoordinacionRepository,
    teacherRepository,
    evaluationConfigurationRepository,
    logger,
  }) {
    if (!calificacionContextoRepository) {
      throw new Error('calificacionContextoRepository es requerido');
    }
    if (!calificacionCoordinacionRepository) {
      throw new Error('calificacionCoordinacionRepository es requerido');
    }
    if (!teacherRepository) throw new Error('teacherRepository es requerido');
    if (!evaluationConfigurationRepository) {
      throw new Error('evaluationConfigurationRepository es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.teacherRepository = teacherRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number, docenteId?: number|null }} input
   */
  async execute({ usuarioId, docenteId: docenteIdInput = null }) {
    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();
    if (!ctx?.gestion_id) {
      const err = new Error('No hay gestión académica vigente configurada');
      err.statusCode = 404;
      throw err;
    }

    const bimestreVigente = Number(ctx.bimestre_vigente) || null;
    const gestionVigente =
      ctx.gestion_nombre != null
        ? String(ctx.gestion_nombre)
        : ctx.gestion_anio != null
          ? String(ctx.gestion_anio)
          : null;

    let docenteId = docenteIdInput != null ? Number(docenteIdInput) : null;
    if (docenteId != null && (!Number.isFinite(docenteId) || docenteId < 1)) {
      throw new NotFoundError('Docente');
    }

    if (docenteId == null) {
      const teachers = await this.teacherRepository.findAll({ userId: usuarioId });
      const teacher = teachers?.[0] ?? null;
      if (!teacher) {
        throw new ForbiddenError(
          'Tu usuario no está vinculado a un docente. Contactá a coordinación académica.',
        );
      }
      const plain = teacher.toPlainObject?.() ?? teacher;
      docenteId = Number(plain.id ?? plain.docenteId);
      if (!Number.isFinite(docenteId) || docenteId < 1) {
        throw new ForbiddenError('No se pudo resolver el docente de la sesión.');
      }
    }

    const docenteRow =
      await this.calificacionCoordinacionRepository.obtenerDocenteCalificaciones(docenteId);
    if (!docenteRow) {
      throw new NotFoundError('Docente');
    }

    const politicaRow = await this.evaluationConfigurationRepository.findActiveRowByGestionId(
      ctx.gestion_id,
    );
    const politicaParsed = parsePoliticaFromRow(politicaRow) ?? {};
    const notaMinimaAprobacion = Number(politicaParsed.notaMinimaAprobacion) || 61;

    const [filas, resumenBimestres, periodosCalendario] = await Promise.all([
      this.calificacionCoordinacionRepository.listarCursosPorDocente(docenteId),
      this.calificacionCoordinacionRepository.listarResumenBimestresCursosPorDocente(
        docenteId,
        notaMinimaAprobacion,
      ),
      this.calificacionContextoRepository.obtenerPeriodosBimestresGestion(ctx.gestion_id),
    ]);

    const resumenMap = agruparResumenBimestres(resumenBimestres);
    const periodosMap = buildPeriodosCalendarioMap(periodosCalendario);

    const cursos = filas.map((row) => {
      const estudiantes = Number(row.cantidad_estudiantes ?? 0);
      const evaluaciones = Number(row.cantidad_evaluaciones_bimestre ?? 0);
      const asignacionId = Number(row.asignacion_docente_id);
      let badgeTipo = 'en-curso';
      let badgeTexto = null;

      if (bimestreVigente != null) {
        if (evaluaciones === 0) {
          badgeTipo = 'sin-evaluaciones';
          badgeTexto = 'Sin evaluaciones';
        } else {
          badgeTexto = `B${bimestreVigente} · ${evaluaciones} evaluaciones`;
        }
      } else if (evaluaciones === 0) {
        badgeTipo = 'sin-evaluaciones';
        badgeTexto = 'Sin evaluaciones';
      }

      const bimestres = armarBimestresCurso(
        asignacionId,
        resumenMap,
        periodosMap,
        estudiantes,
      );

      return {
        id: asignacionId,
        materia: row.materia_nombre ?? '',
        materiaSigla: row.materia_sigla ?? null,
        carrera: row.carrera_nombre ?? '',
        carreraColor: row.carrera_color_hex ?? '#64748b',
        periodo: row.asignatura_periodo_nombre ?? null,
        paralelo: row.paralelo_nombre ?? '',
        turno: row.paralelo_turno ?? '',
        estudiantes,
        badge: {
          tipo: badgeTipo,
          texto: badgeTexto,
        },
        bimestres,
      };
    });

    this.logger.info('[Calificaciones] Cursos del docente listados', {
      docenteId,
      cantidad: cursos.length,
      gestionId: ctx.gestion_id,
    });

    return {
      docente: {
        id: docenteRow.docente_id,
        nombre: docenteRow.docente_nombre ?? '',
        gestionVigente,
        bimestreVigente,
        bimestreNombre: ctx.bimestre_nombre ?? null,
        notaMinimaAprobacion,
        periodoLectivoEnCurso:
          periodosCalendario.find((p) => p.estado_calendario === 'abierto')?.nombre ??
          ctx.bimestre_nombre ??
          null,
      },
      cursos,
    };
  }
}
