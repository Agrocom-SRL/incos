import { ForbiddenError, NotFoundError } from '../../../domain/errors/AppError.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';
import { obtenerCuotasCursoDesdeAjustes } from '../../utils/obtenerCuotasCursoDesdeAjustes.js';
import { recalcularNotasBimestreCurso } from '../../utils/recalcularNotasBimestreCurso.js';
import { recalcularNotaFinalMatriculaCurso } from '../../utils/recalcularNotaFinalMatriculaCurso.js';

export class DeleteEvaluacionCuadernoUseCase {
  constructor({
    calificacionRepository,
    cuadernoRepository,
    ajustesCursoRepository,
    bimesterEvaluationRepository,
    teacherRepository,
    authRepository,
    logger,
  }) {
    this.calificacionRepository = calificacionRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.ajustesCursoRepository = ajustesCursoRepository;
    this.bimesterEvaluationRepository = bimesterEvaluationRepository;
    this.teacherRepository = teacherRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, bimestre, evaluacionId }) {
    const bimestreNum = Number(bimestre);

    const { bimestreVigente } = await assertCuadernoCursoAccess({
      calificacionRepository: this.calificacionRepository,
      teacherRepository: this.teacherRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId,
    });

    if (bimestreNum !== bimestreVigente) {
      throw new ForbiddenError('Solo podés eliminar evaluaciones del bimestre vigente.');
    }

    const existente = await this.cuadernoRepository.obtenerEvaluacionDeAsignacion(
      Number(evaluacionId),
      Number(asignacionId),
    );
    if (!existente) {
      throw new NotFoundError('Evaluación');
    }
    if (existente.notas_cerradas) {
      throw new ForbiddenError('Esta evaluación está cerrada y no se puede eliminar.');
    }

    await this.cuadernoRepository.softEliminarNotasPorEvaluacion(Number(evaluacionId), usuarioId);

    const ajustes = await this.ajustesCursoRepository.obtenerAjustes(Number(asignacionId));
    const { cuotaTeorico, cuotaPractico, pesosBimestres } = obtenerCuotasCursoDesdeAjustes(ajustes);

    await recalcularNotasBimestreCurso({
      cuadernoRepository: this.cuadernoRepository,
      asignacionId: Number(asignacionId),
      bimestreNumero: bimestreNum,
      cuotaTeorico,
      cuotaPractico,
      usuarioId,
    });

    await recalcularNotaFinalMatriculaCurso({
      cuadernoRepository: this.cuadernoRepository,
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
