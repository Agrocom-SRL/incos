import { NotFoundError } from '../../../../domain/errors/AppError.js';
import { assertAsistenciaCursoAccess } from '../../../utils/asistenciaCursoAccess.js';
import { ESTADOS_REGISTRO_ASISTENCIA } from '../../../../domain/constants/asistencia.constants.js';

/**
 * Reabre el registro de asistencia del curso en un bimestre: vuelve ABIERTA todas las
 * sesiones del curso en ese bimestre (lote), habilitando edición (incluida TARDANZA).
 */
export class ReabrirRegistroAsistenciaUseCase {
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

  async execute({ usuarioId, asignacionId, bimestre, fecha }) {
    const bimestreNum = Number(bimestre);
    if (!Number.isFinite(bimestreNum) || bimestreNum < 1 || bimestreNum > 4) {
      throw new NotFoundError('Bimestre');
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

    const periodoAcademicoId = await this.cuadernoRepository.obtenerPeriodoAcademicoId(
      gestionId,
      bimestreNum,
    );
    if (!periodoAcademicoId) {
      throw new NotFoundError('Periodo académico del bimestre');
    }

    // Reapertura por DÍA (preferido): vuelve ABIERTA una sola sesión.
    if (fecha) {
      const sesion = await this.sesionClaseRepository.reabrirSesionDia(
        Number(asignacionId),
        fecha,
        usuarioId,
      );
      this.logger.info('[Asistencia] Día reabierto', {
        asignacionId: Number(asignacionId),
        bimestre: bimestreNum,
        fecha,
      });
      return { bimestre: bimestreNum, fecha, sesionEstado: sesion.sesionEstado };
    }

    // Reapertura en LOTE por bimestre (legacy / acción masiva).
    const afectadas = await this.sesionClaseRepository.reabrirSesionesBimestre(
      Number(asignacionId),
      periodoAcademicoId,
      usuarioId,
    );

    this.logger.info('[Asistencia] Registro reabierto por bimestre', {
      asignacionId: Number(asignacionId),
      bimestre: bimestreNum,
      sesionesReabiertas: afectadas,
    });

    return {
      bimestre: bimestreNum,
      registroEstado: ESTADOS_REGISTRO_ASISTENCIA.ABIERTO,
      sesionesAfectadas: afectadas,
    };
  }
}
