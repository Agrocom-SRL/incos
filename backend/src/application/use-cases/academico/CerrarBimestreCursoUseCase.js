import { ValidationError } from '../../../domain/errors/AppError.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';
import { cargarCuotasPoliticaGestion } from '../../utils/obtenerCuotasDesdePolitica.js';
import { recalcularNotasBimestreCurso } from '../../utils/recalcularNotasBimestreCurso.js';
import { recalcularNotaFinalMatriculaCurso } from '../../utils/recalcularNotaFinalMatriculaCurso.js';

/**
 * Cierra (consolida) un bimestre del curso: recalcula componentes y nota final,
 * y deja las matrículas del curso en estado CERRADO.
 */
export class CerrarBimestreCursoUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    cuadernoRepository,
    subjectEnrollmentRepository,
    subjectEnrollmentBimesterRepository,
    evaluationConfigurationRepository,
    teacherRepository,
    userRepository,
    authRepository,
    logger,
  }) {
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.subjectEnrollmentBimesterRepository = subjectEnrollmentBimesterRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, bimestreNum }) {
    const numero = Number(bimestreNum);
    if (!Number.isFinite(numero) || numero < 1 || numero > 4) {
      throw new ValidationError('Bimestre inválido');
    }

    const { gestionId } = await assertCuadernoCursoAccess({
      calificacionCoordinacionRepository: this.calificacionCoordinacionRepository,
      calificacionContextoRepository: this.calificacionContextoRepository,
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId,
    });

    const { cuotaTeorico, cuotaPractico, pesosBimestres } = await cargarCuotasPoliticaGestion({
      calificacionContextoRepository: this.calificacionContextoRepository,
      evaluationConfigurationRepository: this.evaluationConfigurationRepository,
      gestionId,
    });

    const recalculoBimestre = await recalcularNotasBimestreCurso({
      cuadernoRepository: this.cuadernoRepository,
      subjectEnrollmentBimesterRepository: this.subjectEnrollmentBimesterRepository,
      asignacionId: Number(asignacionId),
      bimestreNumero: numero,
      cuotaTeorico,
      cuotaPractico,
      usuarioId,
    });

    const recalculoFinal = await recalcularNotaFinalMatriculaCurso({
      cuadernoRepository: this.cuadernoRepository,
      subjectEnrollmentRepository: this.subjectEnrollmentRepository,
      asignacionId: Number(asignacionId),
      pesosBimestres,
      usuarioId,
    });

    await this.subjectEnrollmentBimesterRepository.cerrarBimestreCurso(
      Number(asignacionId),
      numero,
      usuarioId,
    );

    this.logger.info('[Calificaciones] Bimestre cerrado por curso', {
      asignacionId,
      bimestre: numero,
      ...recalculoBimestre,
      ...recalculoFinal,
    });

    return { bimestre: numero, cerrado: true, ...recalculoBimestre, ...recalculoFinal };
  }
}
