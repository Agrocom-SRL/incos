import { NotFoundError } from '../../../../domain/errors/AppError.js';
import { resolveDocenteIdForUsuario } from '../../../utils/resolveDocenteIdForUsuario.js';

/**
 * Cursos del docente para "Mis cursos" de Asistencia (gestión vigente).
 *
 * Gemelo de ListCursosCalificacionesUseCase pero DELGADO: la asistencia no usa
 * bimestres/evaluaciones/política, solo el roster del docente. Reutiliza las MISMAS
 * vistas/repos de mis-cursos de Calificaciones (decisión MODULO-ASISTENCIA.md §8: no
 * duplicar la base de mis-cursos).
 */
export class GetMisCursosAsistenciaUseCase {
  constructor({
    calificacionContextoRepository,
    calificacionCoordinacionRepository,
    teacherRepository,
    userRepository,
    logger,
  }) {
    if (!calificacionContextoRepository) {
      throw new Error('calificacionContextoRepository es requerido');
    }
    if (!calificacionCoordinacionRepository) {
      throw new Error('calificacionCoordinacionRepository es requerido');
    }
    if (!teacherRepository) throw new Error('teacherRepository es requerido');
    if (!userRepository) throw new Error('userRepository es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
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
      docenteId = await resolveDocenteIdForUsuario({
        teacherRepository: this.teacherRepository,
        userRepository: this.userRepository,
        usuarioId,
      });
    }

    const docenteRow =
      await this.calificacionCoordinacionRepository.obtenerDocenteCalificaciones(docenteId);
    if (!docenteRow) {
      throw new NotFoundError('Docente');
    }

    const filas = await this.calificacionCoordinacionRepository.listarCursosPorDocente(docenteId);

    const cursos = (filas ?? []).map((row) => ({
      id: Number(row.asignacion_docente_id),
      materia: row.materia_nombre ?? '',
      materiaSigla: row.materia_sigla ?? null,
      carrera: row.carrera_nombre ?? '',
      carreraColor: row.carrera_color_hex ?? '#64748b',
      periodo: row.asignatura_periodo_nombre ?? null,
      paralelo: row.paralelo_nombre ?? '',
      turno: row.paralelo_turno ?? '',
      estudiantes: Number(row.cantidad_estudiantes ?? 0),
    }));

    this.logger.info('[Asistencia] Cursos del docente listados', {
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
      },
      cursos,
    };
  }
}
