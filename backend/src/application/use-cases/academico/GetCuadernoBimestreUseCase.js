import { NotFoundError } from '../../../domain/errors/AppError.js';
import { BimesterEvaluation } from '../../../domain/entities/BimesterEvaluation.js';
import {
  mapEvaluacionEntityToDto,
  mapNotaRowToDto
} from '../../mappers/cuadernoEvaluacionMapper.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';
import { sincronizarNotasAsistenciaBimestre } from '../../utils/sincronizarNotasAsistenciaBimestre.js';

/**
 * GET cuaderno — evaluaciones del bimestre y notas ya cargadas.
 */
export class GetCuadernoBimestreUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    cuadernoRepository,
    subjectEnrollmentBimesterRepository,
    asistenciaPlanillaViewRepository,
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
    this.asistenciaPlanillaViewRepository = asistenciaPlanillaViewRepository;
    this.bimesterEvaluationGradeRepository = bimesterEvaluationGradeRepository;
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

    const { gestionId, bimestreVigente } = await assertCuadernoCursoAccess({
      calificacionCoordinacionRepository: this.calificacionCoordinacionRepository,
      calificacionContextoRepository: this.calificacionContextoRepository,
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId
    });

    await this.subjectEnrollmentBimesterRepository.asegurarBimestresMatriculaCurso(
      Number(asignacionId),
      bimestreVigente,
      usuarioId
    );

    const periodoId = await this.cuadernoRepository.obtenerPeriodoAcademicoId(
      gestionId,
      bimestreNum
    );
    if (!periodoId) {
      throw new NotFoundError('Periodo académico del bimestre');
    }

    // Recalcular la(s) columna(s) ASISTENCIA ANTES de leer las notas, para que la
    // celda refleje la asistencia actual sin esperar al cierre del bimestre.
    // Side-effect tolerante a fallos y con guard de estado (solo EN_CURSO/REABIERTO).
    await sincronizarNotasAsistenciaBimestre({
      calificacionContextoRepository: this.calificacionContextoRepository,
      cuadernoRepository: this.cuadernoRepository,
      asistenciaPlanillaViewRepository: this.asistenciaPlanillaViewRepository,
      subjectEnrollmentBimesterRepository: this.subjectEnrollmentBimesterRepository,
      bimesterEvaluationGradeRepository: this.bimesterEvaluationGradeRepository,
      asignacionId: Number(asignacionId),
      gestionId,
      bimestreNumero: bimestreNum,
      usuarioId,
      logger: this.logger
    });

    const [filasEval, filasNotas] = await Promise.all([
      this.cuadernoRepository.listarEvaluaciones(Number(asignacionId), periodoId),
      this.cuadernoRepository.listarNotasCuaderno(Number(asignacionId), bimestreNum)
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
          gradesClosed: Boolean(row.notas_cerradas)
        })
      )
    );

    const notas = filasNotas.map(mapNotaRowToDto);

    const reabierto =
      (await this.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso(
        Number(asignacionId),
        bimestreNum
      )) > 0;

    this.logger.info('[Calificaciones] Cuaderno bimestre', {
      asignacionId,
      bimestre: bimestreNum,
      evaluaciones: evaluaciones.length,
      notas: notas.length,
      reabierto
    });

    return { bimestre: bimestreNum, evaluaciones, notas, reabierto };
  }
}
