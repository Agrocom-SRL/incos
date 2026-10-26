import { ForbiddenError, NotFoundError } from '../../../domain/errors/AppError.js';
import { assertBimestreEditable } from '../../utils/assertBimestreEditable.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';
import { cargarCuotasPoliticaGestion } from '../../utils/obtenerCuotasDesdePolitica.js';
import { recalcularNotasBimestreCurso } from '../../utils/recalcularNotasBimestreCurso.js';
import { recalcularNotaFinalMatriculaCurso } from '../../utils/recalcularNotaFinalMatriculaCurso.js';

export class DeleteEvaluacionCuadernoUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    cuadernoRepository,
    subjectEnrollmentRepository,
    subjectEnrollmentBimesterRepository,
    bimesterEvaluationGradeRepository,
    evaluationConfigurationRepository,
    bimesterEvaluationRepository,
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
    this.bimesterEvaluationGradeRepository = bimesterEvaluationGradeRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
    this.bimesterEvaluationRepository = bimesterEvaluationRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, bimestre, evaluacionId }) {
    const bimestreNum = Number(bimestre);

    const { gestionId } = await assertCuadernoCursoAccess({
      calificacionCoordinacionRepository: this.calificacionCoordinacionRepository,
      calificacionContextoRepository: this.calificacionContextoRepository,
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId,
    });

    // Misma compuerta que Create/Upsert/Guardar: EN_CURSO o REABIERTO; cerrado solo tras reapertura.
    const { reabierto } = await assertBimestreEditable({
      calificacionContextoRepository: this.calificacionContextoRepository,
      subjectEnrollmentBimesterRepository: this.subjectEnrollmentBimesterRepository,
      gestionId,
      asignacionId,
      bimestreNum,
    });

    const existente = await this.cuadernoRepository.obtenerEvaluacionDeAsignacion(
      Number(evaluacionId),
      Number(asignacionId),
    );
    if (!existente) {
      throw new NotFoundError('Evaluación');
    }
    const periodoId = await this.cuadernoRepository.obtenerPeriodoAcademicoId(gestionId, bimestreNum);
    if (!periodoId || Number(existente.periodo_academico_id) !== Number(periodoId)) {
      throw new NotFoundError('Evaluación');
    }
    if (existente.notas_cerradas && !reabierto) {
      throw new ForbiddenError('Esta evaluación está cerrada y no se puede eliminar.');
    }

    await this.bimesterEvaluationGradeRepository.softEliminarNotasPorEvaluacion(Number(evaluacionId), usuarioId);

    const { cuotaTeorico, cuotaPractico, pesosBimestres } = await cargarCuotasPoliticaGestion({
      calificacionContextoRepository: this.calificacionContextoRepository,
      evaluationConfigurationRepository: this.evaluationConfigurationRepository,
      gestionId,
    });

    await recalcularNotasBimestreCurso({
      cuadernoRepository: this.cuadernoRepository,
      subjectEnrollmentBimesterRepository: this.subjectEnrollmentBimesterRepository,
      asignacionId: Number(asignacionId),
      bimestreNumero: bimestreNum,
      cuotaTeorico,
      cuotaPractico,
      usuarioId,
    });

    await recalcularNotaFinalMatriculaCurso({
      cuadernoRepository: this.cuadernoRepository,
      subjectEnrollmentRepository: this.subjectEnrollmentRepository,
      asignacionId: Number(asignacionId),
      pesosBimestres,
      usuarioId,
    });

    await this.bimesterEvaluationRepository.delete(Number(evaluacionId), usuarioId);

    this.logger.info('[Calificaciones] Evaluación eliminada y notas recalculadas', {
      asignacionId,
      evaluacionId,
    });

    return { id: Number(evaluacionId) };
  }
}
