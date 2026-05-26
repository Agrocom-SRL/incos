import { ForbiddenError, NotFoundError } from '../../../domain/errors/AppError.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';
import { cargarCuotasPoliticaGestion } from '../../utils/obtenerCuotasDesdePolitica.js';
import { recalcularNotasBimestreCurso } from '../../utils/recalcularNotasBimestreCurso.js';
import { recalcularNotaFinalMatriculaCurso } from '../../utils/recalcularNotaFinalMatriculaCurso.js';

export class ResetNotasEvaluacionCuadernoUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    cuadernoRepository,
    evaluationConfigurationRepository,
    teacherRepository,
    userRepository,
    authRepository,
    logger,
  }) {
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, bimestre, evaluacionId }) {
    const bimestreNum = Number(bimestre);
    const evalId = Number(evaluacionId);

    const { bimestreVigente, gestionId } = await assertCuadernoCursoAccess({
      calificacionCoordinacionRepository: this.calificacionCoordinacionRepository,
      calificacionContextoRepository: this.calificacionContextoRepository,
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId,
    });

    if (bimestreNum !== bimestreVigente) {
      throw new ForbiddenError('Solo podés restablecer notas del bimestre vigente.');
    }

    const existente = await this.cuadernoRepository.obtenerEvaluacionDeAsignacion(
      evalId,
      Number(asignacionId),
    );
    if (!existente) {
      throw new NotFoundError('Evaluación');
    }
    if (existente.notas_cerradas) {
      throw new ForbiddenError('Las notas de esta evaluación están cerradas.');
    }

    await this.cuadernoRepository.softEliminarNotasPorEvaluacion(evalId, usuarioId);

    const { cuotaTeorico, cuotaPractico, pesosBimestres } = await cargarCuotasPoliticaGestion({
      calificacionContextoRepository: this.calificacionContextoRepository,
      evaluationConfigurationRepository: this.evaluationConfigurationRepository,
      gestionId,
    });

    const recalculo = await recalcularNotasBimestreCurso({
      cuadernoRepository: this.cuadernoRepository,
      asignacionId: Number(asignacionId),
      bimestreNumero: bimestreNum,
      cuotaTeorico,
      cuotaPractico,
      usuarioId,
    });

    const recalculoFinal = await recalcularNotaFinalMatriculaCurso({
      cuadernoRepository: this.cuadernoRepository,
      asignacionId: Number(asignacionId),
      pesosBimestres,
      usuarioId,
    });

    this.logger.info('[Calificaciones] Notas de evaluación restablecidas', {
      asignacionId,
      evaluacionId: evalId,
      ...recalculo,
    });

    return { evaluacionId: evalId, ...recalculo, ...recalculoFinal };
  }
}
