import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../../domain/errors/AppError.js';
import { BimesterEvaluation } from '../../../domain/entities/BimesterEvaluation.js';
import { mapEvaluacionEntityToDto } from '../../mappers/cuadernoEvaluacionMapper.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';

/**
 * POST evaluación del cuaderno bimestral.
 */
export class CreateEvaluacionCuadernoUseCase {
  constructor({
    calificacionRepository,
    cuadernoRepository,
    bimesterEvaluationRepository,
    evaluationTypeRepository,
    teacherRepository,
    authRepository,
    logger,
  }) {
    this.calificacionRepository = calificacionRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.bimesterEvaluationRepository = bimesterEvaluationRepository;
    this.evaluationTypeRepository = evaluationTypeRepository;
    this.teacherRepository = teacherRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, bimestre, body }) {
    const bimestreNum = Number(bimestre);
    if (!Number.isFinite(bimestreNum) || bimestreNum < 1 || bimestreNum > 4) {
      throw new ValidationError('Bimestre inválido');
    }

    const { bimestreVigente, gestionId } = await assertCuadernoCursoAccess({
      calificacionRepository: this.calificacionRepository,
      teacherRepository: this.teacherRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId,
    });

    if (bimestreNum !== bimestreVigente) {
      throw new ForbiddenError(
        'Solo podés crear evaluaciones en el bimestre vigente de la gestión.',
      );
    }

    const periodoId = await this.cuadernoRepository.obtenerPeriodoAcademicoId(
      gestionId,
      bimestreNum,
    );
    if (!periodoId) {
      throw new NotFoundError('Periodo académico del bimestre');
    }

    const tipoId = Number(body?.tipoEvaluacionId);
    if (!Number.isFinite(tipoId) || tipoId < 1) {
      throw new ValidationError('Tipo de evaluación requerido');
    }

    const tipo = await this.evaluationTypeRepository.findById(tipoId);
    if (!tipo) {
      throw new ValidationError('Tipo de evaluación no encontrado');
    }
    const tipoPlain = tipo.toPlainObject?.() ?? tipo;
    if (tipoPlain.scope !== 'BIMESTRE' && tipoPlain.ambito !== 'BIMESTRE') {
      throw new ValidationError('El tipo debe ser de ámbito bimestre');
    }

    const nombre = String(body?.nombre ?? '').trim();
    if (!nombre) {
      throw new ValidationError('Nombre descriptivo requerido');
    }

    const componente = body?.componente;
    if (componente !== 'TEORICO' && componente !== 'PRACTICO') {
      throw new ValidationError('Componente inválido');
    }

    const peso = Number(body?.peso);
    if (!Number.isFinite(peso) || peso <= 0 || peso > 100) {
      throw new ValidationError('Peso inválido (debe ser entre 0.01 y 100)');
    }

    const entity = new BimesterEvaluation({
      teacherAssignmentId: Number(asignacionId),
      academicPeriodId: periodoId,
      evaluationTypeId: tipoId,
      component: componente,
      evaluationName: nombre,
      weight: peso,
      date: body?.fecha ?? null,
      gradesClosed: false,
    });

    const created = await this.bimesterEvaluationRepository.create(entity, usuarioId);
    const dto = mapEvaluacionEntityToDto(created);

    this.logger.info('[Calificaciones] Evaluación creada', {
      asignacionId,
      bimestre: bimestreNum,
      evaluacionId: dto.id,
    });

    return dto;
  }
}
