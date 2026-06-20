import { ConflictError, ValidationError } from '../../../../domain/errors/AppError.js';
import { assertAsistenciaCursoAccess } from '../../../utils/asistenciaCursoAccess.js';
import { toISODate } from '../../../utils/asistenciaCalendario.js';

/**
 * Crea una sesión especial (es_especial = TRUE): taller/recuperación fuera de horario.
 *
 * - PERMITE fecha futura (la sesión puede crearse a futuro; no se MARCA hasta su día,
 *   lo valida BulkRegistrarAsistenciaUseCase).
 * - No duplica asignacion + fecha (la sesión es 1 curso × 1 fecha).
 * - Resuelve el periodo_academico_id (bimestre) por la fecha.
 */
export class CrearSesionEspecialUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    cuadernoRepository,
    sesionClaseRepository,
    teacherRepository,
    userRepository,
    authRepository,
    logger,
  }) {
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.sesionClaseRepository = sesionClaseRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, body }) {
    const fecha = toISODate(body?.fecha);
    if (!fecha) {
      throw new ValidationError('fecha inválida');
    }
    const motivo = String(body?.motivo ?? '').trim();
    if (!motivo) {
      throw new ValidationError('El motivo de la sesión especial es obligatorio');
    }

    const { gestionId } = await assertAsistenciaCursoAccess({
      calificacionCoordinacionRepository: this.calificacionCoordinacionRepository,
      calificacionContextoRepository: this.calificacionContextoRepository,
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId,
    });

    const asignacionIdNum = Number(asignacionId);

    // Permite editar una sesión ESPECIAL existente (mismo curso+fecha); solo bloquea
    // si ese día ya tiene una sesión de horario regular (no es especial).
    const existente = await this.sesionClaseRepository.obtenerSesionPorFecha(
      asignacionIdNum,
      fecha,
    );
    if (existente && !existente.esEspecial) {
      throw new ConflictError(`El ${fecha} es un día de horario regular en este curso.`);
    }

    // Resolver bimestre por la fecha.
    const periodos =
      await this.calificacionContextoRepository.obtenerPeriodosBimestresGestion(gestionId);
    const periodo = (periodos ?? []).find(
      (x) => toISODate(x.fecha_inicio) <= fecha && fecha <= toISODate(x.fecha_fin),
    );
    const periodoAcademicoId = periodo
      ? await this.cuadernoRepository.obtenerPeriodoAcademicoId(
          gestionId,
          Number(periodo.numero_orden),
        )
      : null;

    const { id } = await this.sesionClaseRepository.upsertSesion(
      asignacionIdNum,
      fecha,
      {
        esEspecial: true,
        motivo,
        periodoAcademicoId,
        horaInicio: body?.horaInicio ?? null,
        horaFin: body?.horaFin ?? null,
      },
      usuarioId,
    );

    this.logger.info('[Asistencia] Sesión especial creada', {
      asignacionId: asignacionIdNum,
      fecha,
      sesionClaseId: id,
    });

    return {
      sesionClaseId: id,
      fechaClase: fecha,
      esSesionEspecial: true,
      motivo,
      periodoAcademicoId,
    };
  }
}
