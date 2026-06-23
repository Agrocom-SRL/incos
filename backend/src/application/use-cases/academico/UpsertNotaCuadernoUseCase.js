import { ValidationError } from '../../../domain/errors/AppError.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';
import { assertBimestreEditable } from '../../utils/assertBimestreEditable.js';
import { persistirNotaCuadernoCelda } from '../../utils/persistirNotaCuadernoCelda.js';

/**
 * PUT celda del cuaderno — carga perezosa en evaluaciones_notas.
 */
export class UpsertNotaCuadernoUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    cuadernoRepository,
    subjectEnrollmentBimesterRepository,
    bimesterEvaluationGradeRepository,
    teacherRepository,
    userRepository,
    authRepository,
    logger
  }) {
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.subjectEnrollmentBimesterRepository = subjectEnrollmentBimesterRepository;
    this.bimesterEvaluationGradeRepository = bimesterEvaluationGradeRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, bimestre, body }) {
    const bimestreNum = Number(bimestre);
    if (!Number.isFinite(bimestreNum) || bimestreNum < 1 || bimestreNum > 4) {
      throw new ValidationError('Bimestre inválido');
    }

    const estudianteId = Number(body?.estudianteId);
    const evaluacionId = Number(body?.evaluacionId);
    if (!Number.isFinite(estudianteId) || estudianteId < 1) {
      throw new ValidationError('Estudiante requerido');
    }
    if (!Number.isFinite(evaluacionId) || evaluacionId < 1) {
      throw new ValidationError('Evaluación requerida');
    }

    const { gestionId } = await assertCuadernoCursoAccess({
      calificacionCoordinacionRepository: this.calificacionCoordinacionRepository,
      calificacionContextoRepository: this.calificacionContextoRepository,
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId
    });

    // Compuerta por ESTADO del bimestre (EN_CURSO o REABIERTO), no por fecha vigente.
    const { reabierto } = await assertBimestreEditable({
      calificacionContextoRepository: this.calificacionContextoRepository,
      subjectEnrollmentBimesterRepository: this.subjectEnrollmentBimesterRepository,
      gestionId,
      asignacionId,
      bimestreNum
    });

    const resultado = await persistirNotaCuadernoCelda({
      cuadernoRepository: this.cuadernoRepository,
      subjectEnrollmentBimesterRepository: this.subjectEnrollmentBimesterRepository,
      bimesterEvaluationGradeRepository: this.bimesterEvaluationGradeRepository,
      asignacionId: Number(asignacionId),
      bimestreNum,
      gestionId,
      estudianteId,
      evaluacionId,
      notaRaw: body?.nota,
      usuarioId,
      reabierto
    });

    this.logger.info('[Calificaciones] Nota guardada', {
      asignacionId,
      bimestre: bimestreNum,
      estudianteId,
      evaluacionId,
      nota: resultado.nota
    });

    return resultado;
  }
}
