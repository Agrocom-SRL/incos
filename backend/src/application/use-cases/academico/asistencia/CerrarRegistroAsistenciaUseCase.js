import { NotFoundError } from '../../../../domain/errors/AppError.js';
import { assertAsistenciaCursoAccess } from '../../../utils/asistenciaCursoAccess.js';
import { ESTADOS_REGISTRO_ASISTENCIA } from '../../../../domain/constants/asistencia.constants.js';

/**
 * Cierra el registro de asistencia del curso en un bimestre: pone CERRADA todas las
 * sesiones del curso en ese bimestre (lote). El estado agregado se deriva por vista.
 */
export class CerrarRegistroAsistenciaUseCase {
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

  async execute({ usuarioId, asignacionId, bimestre }) {
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

    const afectadas = await this.sesionClaseRepository.cerrarSesionesBimestre(
      Number(asignacionId),
      periodoAcademicoId,
      usuarioId,
    );

    this.logger.info('[Asistencia] Registro cerrado por bimestre', {
      asignacionId: Number(asignacionId),
      bimestre: bimestreNum,
      sesionesCerradas: afectadas,
    });

    return {
      bimestre: bimestreNum,
      registroEstado: ESTADOS_REGISTRO_ASISTENCIA.CERRADO,
      sesionesAfectadas: afectadas,
    };
  }
}
