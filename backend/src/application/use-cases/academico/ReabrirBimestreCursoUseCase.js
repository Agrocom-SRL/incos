import { ValidationError } from '../../../domain/errors/AppError.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';

/**
 * Reabre un bimestre del curso (estado REABIERTO) para permitir editar el cuaderno
 * fuera del bimestre vigente. El ajuste de notas se hace reabriendo el cuaderno.
 */
export class ReabrirBimestreCursoUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    subjectEnrollmentBimesterRepository,
    teacherRepository,
    userRepository,
    authRepository,
    logger,
  }) {
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.subjectEnrollmentBimesterRepository = subjectEnrollmentBimesterRepository;
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

    await assertCuadernoCursoAccess({
      calificacionCoordinacionRepository: this.calificacionCoordinacionRepository,
      calificacionContextoRepository: this.calificacionContextoRepository,
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId,
    });

    await this.subjectEnrollmentBimesterRepository.reabrirBimestreCurso(
      Number(asignacionId),
      numero,
      usuarioId,
    );

    const reabiertos = await this.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso(
      Number(asignacionId),
      numero,
    );

    this.logger.info('[Calificaciones] Bimestre reabierto', {
      asignacionId,
      bimestre: numero,
      reabiertos,
    });

    return { bimestre: numero, reabierto: true, matriculasReabiertas: reabiertos };
  }
}
