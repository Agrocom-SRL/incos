import { ValidationError } from '../../../domain/errors/AppError.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';
import { assertBimestreEditable } from '../../utils/assertBimestreEditable.js';
import { cargarCuotasPoliticaGestion } from '../../utils/obtenerCuotasDesdePolitica.js';
import { persistirNotaCuadernoCelda } from '../../utils/persistirNotaCuadernoCelda.js';
import { recalcularNotasBimestreCurso } from '../../utils/recalcularNotasBimestreCurso.js';
import { recalcularNotasAsistenciaCurso } from '../../utils/recalcularNotasAsistenciaCurso.js';
import { recalcularNotaFinalMatriculaCurso } from '../../utils/recalcularNotaFinalMatriculaCurso.js';

/**
 * Guarda notas del cuaderno (lote) y recalcula bimestre + nota_final.
 */
export class GuardarNotasCuadernoBimestreUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    cuadernoRepository,
    subjectEnrollmentRepository,
    subjectEnrollmentBimesterRepository,
    bimesterEvaluationGradeRepository,
    asistenciaPlanillaViewRepository,
    evaluationConfigurationRepository,
    teacherRepository,
    userRepository,
    authRepository,
    logger
  }) {
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.subjectEnrollmentBimesterRepository = subjectEnrollmentBimesterRepository;
    this.bimesterEvaluationGradeRepository = bimesterEvaluationGradeRepository;
    this.asistenciaPlanillaViewRepository = asistenciaPlanillaViewRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
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

    const notasEntrada = Array.isArray(body?.notas) ? body.notas : [];

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

    await this.subjectEnrollmentBimesterRepository.asegurarBimestresMatriculaCurso(
      Number(asignacionId),
      bimestreNum,
      usuarioId
    );

    const guardadas = [];
    for (const item of notasEntrada) {
      const estudianteId = Number(item?.estudianteId);
      const evaluacionId = Number(item?.evaluacionId);
      if (!Number.isFinite(estudianteId) || estudianteId < 1) {
        throw new ValidationError('Estudiante inválido en el lote');
      }
      if (!Number.isFinite(evaluacionId) || evaluacionId < 1) {
        throw new ValidationError('Evaluación inválida en el lote');
      }

      const dto = await persistirNotaCuadernoCelda({
        cuadernoRepository: this.cuadernoRepository,
        subjectEnrollmentBimesterRepository: this.subjectEnrollmentBimesterRepository,
        bimesterEvaluationGradeRepository: this.bimesterEvaluationGradeRepository,
        asignacionId: Number(asignacionId),
        bimestreNum,
        gestionId,
        estudianteId,
        evaluacionId,
        notaRaw: item?.nota,
        usuarioId,
        reabierto
      });
      guardadas.push(dto);
    }

    const { cuotaTeorico, cuotaPractico, pesosBimestres } = await cargarCuotasPoliticaGestion({
      calificacionContextoRepository: this.calificacionContextoRepository,
      evaluationConfigurationRepository: this.evaluationConfigurationRepository,
      gestionId
    });

    // Antes de sumar el práctico, recalcular las celdas de la(s) columna(s) ASISTENCIA:
    // su nota proporcional pondera dentro de la cuota práctica como cualquier columna.
    const recalculoAsistencia = await recalcularNotasAsistenciaCurso({
      cuadernoRepository: this.cuadernoRepository,
      asistenciaPlanillaViewRepository: this.asistenciaPlanillaViewRepository,
      subjectEnrollmentBimesterRepository: this.subjectEnrollmentBimesterRepository,
      bimesterEvaluationGradeRepository: this.bimesterEvaluationGradeRepository,
      asignacionId: Number(asignacionId),
      gestionId,
      bimestreNumero: bimestreNum,
      usuarioId
    });

    const recalculoBimestre = await recalcularNotasBimestreCurso({
      cuadernoRepository: this.cuadernoRepository,
      subjectEnrollmentBimesterRepository: this.subjectEnrollmentBimesterRepository,
      asignacionId: Number(asignacionId),
      bimestreNumero: bimestreNum,
      cuotaTeorico,
      cuotaPractico,
      usuarioId
    });

    const recalculoFinal = await recalcularNotaFinalMatriculaCurso({
      cuadernoRepository: this.cuadernoRepository,
      subjectEnrollmentRepository: this.subjectEnrollmentRepository,
      asignacionId: Number(asignacionId),
      pesosBimestres,
      usuarioId
    });

    this.logger.info('[Calificaciones] Cuaderno guardado y recalculado', {
      asignacionId,
      bimestre: bimestreNum,
      notasGuardadas: guardadas.length,
      ...recalculoAsistencia,
      ...recalculoBimestre,
      ...recalculoFinal
    });

    return {
      notas: guardadas,
      notasGuardadas: guardadas.length,
      ...recalculoAsistencia,
      ...recalculoBimestre,
      ...recalculoFinal
    };
  }
}
