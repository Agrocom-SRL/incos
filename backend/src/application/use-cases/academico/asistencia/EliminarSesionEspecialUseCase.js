import { ConflictError, NotFoundError, ValidationError } from '../../../../domain/errors/AppError.js';
import { assertAsistenciaCursoAccess } from '../../../utils/asistenciaCursoAccess.js';
import { toISODate } from '../../../utils/asistenciaCalendario.js';

/**
 * Elimina (soft-delete) una sesión ESPECIAL (taller/recuperación).
 *
 * Reglas:
 *  - Solo sesiones especiales (es_especial = TRUE); las de horario regular no se borran aquí.
 *  - Solo si NO tiene asistencia tomada ese día (sin celdas en la planilla). Si ya hay
 *    asistencia registrada, se bloquea para no perder datos.
 */
export class EliminarSesionEspecialUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    sesionClaseRepository,
    asistenciaPlanillaViewRepository,
    teacherRepository,
    userRepository,
    authRepository,
    logger,
  }) {
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.sesionClaseRepository = sesionClaseRepository;
    this.asistenciaPlanillaViewRepository = asistenciaPlanillaViewRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, fecha }) {
    const fechaISO = toISODate(fecha);
    if (!fechaISO) {
      throw new ValidationError('fecha inválida');
    }

    await assertAsistenciaCursoAccess({
      calificacionCoordinacionRepository: this.calificacionCoordinacionRepository,
      calificacionContextoRepository: this.calificacionContextoRepository,
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId,
    });

    const asignacionIdNum = Number(asignacionId);

    // Debe existir y ser ESPECIAL.
    const sesion = await this.sesionClaseRepository.obtenerSesionPorFecha(
      asignacionIdNum,
      fechaISO,
    );
    if (!sesion || !sesion.esEspecial) {
      throw new NotFoundError(`No hay una sesión especial el ${fechaISO} en este curso.`);
    }

    // Bloquear si ya tiene asistencia tomada ese día (celdas de planilla).
    const celdas = await this.asistenciaPlanillaViewRepository.listarCeldasPlanilla(
      asignacionIdNum,
      fechaISO,
      fechaISO,
    );
    if ((celdas ?? []).length > 0) {
      throw new ConflictError(
        'No se puede eliminar: ya tiene asistencia registrada en ese día.',
      );
    }

    const { eliminada } = await this.sesionClaseRepository.eliminarSesionEspecial(
      asignacionIdNum,
      fechaISO,
      usuarioId,
    );

    this.logger.info('[Asistencia] Sesión especial eliminada', {
      asignacionId: asignacionIdNum,
      fecha: fechaISO,
      eliminada,
    });

    return { fechaClase: fechaISO, eliminada };
  }
}
