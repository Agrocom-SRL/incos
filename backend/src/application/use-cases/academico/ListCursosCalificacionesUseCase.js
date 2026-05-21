import { ForbiddenError, NotFoundError } from '../../../domain/errors/AppError.js';

/**
 * Cursos del docente para Mis cursos / vista coordinación (gestión vigente).
 */
export class ListCursosCalificacionesUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../infrastructure/repositories/CalificacionRepository.js').CalificacionRepository} deps.calificacionRepository
   * @param {import('../../infrastructure/repositories/TeacherRepository.js').TeacherRepository} deps.teacherRepository
   * @param {Object} deps.logger
   */
  constructor({ calificacionRepository, teacherRepository, logger }) {
    if (!calificacionRepository) throw new Error('calificacionRepository es requerido');
    if (!teacherRepository) throw new Error('teacherRepository es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.calificacionRepository = calificacionRepository;
    this.teacherRepository = teacherRepository;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number, docenteId?: number|null }} input
   */
  async execute({ usuarioId, docenteId: docenteIdInput = null }) {
    const ctx = await this.calificacionRepository.obtenerContextoVigente();
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

    const docenteRow = await this.calificacionRepository.obtenerDocenteCalificaciones(docenteId);
    if (!docenteRow) {
      throw new NotFoundError('Docente');
    }

    const filas = await this.calificacionRepository.listarCursosPorDocente(docenteId);

    const cursos = filas.map((row) => {
      const estudiantes = Number(row.cantidad_estudiantes ?? 0);
      const evaluaciones = Number(row.cantidad_evaluaciones_bimestre ?? 0);
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

      return {
        id: row.asignacion_docente_id,
        materia: row.materia_nombre ?? '',
        paralelo: row.paralelo_nombre ?? '',
        turno: row.paralelo_turno ?? '',
        horasSemana: Number(row.horas_semanales ?? 0),
        estudiantes,
        badge: {
          tipo: badgeTipo,
          texto: badgeTexto,
        },
        notasPendientes: null,
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
      },
      cursos,
    };
  }
}
