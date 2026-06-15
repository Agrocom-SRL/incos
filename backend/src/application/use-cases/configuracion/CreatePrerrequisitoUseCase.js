import { ValidationError } from '../../../domain/errors/AppError.js';

export class CreatePrerrequisitoUseCase {
  constructor({ prerequisiteRepository, logger }) {
    this.prerequisiteRepository = prerequisiteRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    const planEstudioId = body.plan_estudio_id ?? body.planEstudioId ?? null;
    const asignaturaId = body.asignatura_id ?? body.asignaturaId ?? null;
    const prerrequisitoId = body.prerrequisito_id ?? body.prerrequisitoId ?? null;
    if (!planEstudioId) throw new ValidationError('plan_estudio_id es requerido');
    if (!asignaturaId) throw new ValidationError('asignatura_id es requerido');
    if (!prerrequisitoId) throw new ValidationError('prerrequisito_id es requerido');

    const created = await this.prerequisiteRepository.create(
      { studyPlanId: planEstudioId, subjectId: asignaturaId, prerequisiteId: prerrequisitoId, active: true },
      userId
    );
    return { prerrequisito: created };
  }
}

