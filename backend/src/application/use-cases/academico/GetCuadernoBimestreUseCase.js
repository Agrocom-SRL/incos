import { NotFoundError } from '../../../domain/errors/AppError.js';
import { BimesterEvaluation } from '../../../domain/entities/BimesterEvaluation.js';
import {
  mapEvaluacionEntityToDto,
  mapNotaRowToDto,
} from '../../mappers/cuadernoEvaluacionMapper.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';

/**
 * GET cuaderno — evaluaciones del bimestre y notas ya cargadas.
 */
export class GetCuadernoBimestreUseCase {
  constructor({
    calificacionRepository,
    cuadernoRepository,
    teacherRepository,
    authRepository,
    logger,
  }) {
    this.calificacionRepository = calificacionRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.teacherRepository = teacherRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, bimestre }) {
    const bimestreNum = Number(bimestre);
    if (!Number.isFinite(bimestreNum) || bimestreNum < 1 || bimestreNum > 4) {
      throw new NotFoundError('Bimestre');
    }

    const { gestionId } = await assertCuadernoCursoAccess({
      calificacionRepository: this.calificacionRepository,
      teacherRepository: this.teacherRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId,
    });

    const periodoId = await this.cuadernoRepository.obtenerPeriodoAcademicoId(
      gestionId,
      bimestreNum,
    );
    if (!periodoId) {
      throw new NotFoundError('Periodo académico del bimestre');
    }

    const [filasEval, filasNotas] = await Promise.all([
      this.cuadernoRepository.listarEvaluaciones(Number(asignacionId), periodoId),
      this.cuadernoRepository.listarNotasCuaderno(Number(asignacionId), bimestreNum),
    ]);

    const evaluaciones = filasEval.map((row) =>
      mapEvaluacionEntityToDto(
        new BimesterEvaluation({
          id: row.id,
          teacherAssignmentId: Number(asignacionId),
          academicPeriodId: periodoId,
          evaluationTypeId: row.tipo_evaluacion_id,
          component: row.componente,
          evaluationName: row.nombre_evaluacion,
          points: row.puntos,
          date: row.fecha,
          gradesClosed: Boolean(row.notas_cerradas),
        }),
      ),
    );

    const notas = filasNotas.map(mapNotaRowToDto);

    this.logger.info('[Calificaciones] Cuaderno bimestre', {
      asignacionId,
      bimestre: bimestreNum,
      evaluaciones: evaluaciones.length,
      notas: notas.length,
    });

    return { bimestre: bimestreNum, evaluaciones, notas };
  }
}
