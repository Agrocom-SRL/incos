import { ForbiddenError, NotFoundError } from '../../../domain/errors/AppError.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';
import { obtenerCuotasCursoDesdeAjustes } from '../../utils/obtenerCuotasCursoDesdeAjustes.js';
import { recalcularNotasBimestreCurso } from '../../utils/recalcularNotasBimestreCurso.js';
import { recalcularNotaFinalMatriculaCurso } from '../../utils/recalcularNotaFinalMatriculaCurso.js';

export class ResetNotasEvaluacionCuadernoUseCase {
  constructor({
    calificacionRepository,
    cuadernoRepository,
    ajustesCursoRepository,
    teacherRepository,
    authRepository,
    logger,
  }) {
    this.calificacionRepository = calificacionRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.ajustesCursoRepository = ajustesCursoRepository;
    this.teacherRepository = teacherRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, bimestre, evaluacionId }) {
    const bimestreNum = Number(bimestre);
    const evalId = Number(evaluacionId);

    const { bimestreVigente } = await assertCuadernoCursoAccess({
      calificacionRepository: this.calificacionRepository,
      teacherRepository: this.teacherRepository,
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

    const ajustes = await this.ajustesCursoRepository.obtenerAjustes(Number(asignacionId));
    const { cuotaTeorico, cuotaPractico, pesosBimestres } = obtenerCuotasCursoDesdeAjustes(ajustes);

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
