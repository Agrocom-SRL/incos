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

    const { bimestreVigente } = await assertCuadernoCursoAccess({
      calificacionCoordinacionRepository: this.calificacionCoordinacionRepository,
      calificacionContextoRepository: this.calificacionContextoRepository,
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId,
    });

    const asignacionIdNum = Number(asignacionId);

    // Sin filas en bimestres_matricula el UPDATE de reabrir no afecta ninguna matrícula.
    await this.subjectEnrollmentBimesterRepository.asegurarBimestresMatriculaCurso(
      asignacionIdNum,
      bimestreVigente,
      usuarioId,
    );

    await this.subjectEnrollmentBimesterRepository.reabrirBimestreCurso(
      asignacionIdNum,
      numero,
      usuarioId,
    );

    const reabiertos = await this.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso(
      asignacionIdNum,
      numero,
    );

    if (reabiertos === 0) {
      throw new ValidationError(
        'No se pudo reabrir el bimestre: no hay matrículas de bimestre en el curso. ' +
          'Verificá que haya estudiantes inscritos.',
      );
    }

    this.logger.info('[Calificaciones] Bimestre reabierto', {
      asignacionId,
      bimestre: numero,
      reabiertos,
    });

    return { bimestre: numero, reabierto: true, matriculasReabiertas: reabiertos };
  }
}
