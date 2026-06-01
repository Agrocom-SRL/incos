import { ValidationError } from '../../../domain/errors/AppError.js';
import { ParallelMapper } from '../../mappers/academico/index.js';
import { assertParaleloPayload, normalizeParaleloBody } from './paraleloPayload.js';

export class CreateParaleloUseCase {
  constructor({
    parallelRepository,
    periodRepository,
    studyPlanRepository,
    logger,
  }) {
    this.parallelRepository = parallelRepository;
    this.periodRepository = periodRepository;
    this.studyPlanRepository = studyPlanRepository;
    this.logger = logger;
  }

  async assertPeriodBelongsToCareer(careerId, periodId) {
    const period = await this.periodRepository.findById(periodId);
    if (!period?.studyPlanId) {
      throw new ValidationError('periodo_id no válido');
    }
    const plan = await this.studyPlanRepository.findById(period.studyPlanId);
    if (!plan?.careerId || plan.careerId !== careerId) {
      throw new ValidationError('El periodo no pertenece a la carrera seleccionada');
    }
  }

  async assertUnique(careerId, periodId, shift, name, excludeId = null) {
    const existing = await this.parallelRepository.findBy({
      careerId,
      periodId,
      shift,
      name,
    });
    if (existing && existing.id !== excludeId) {
      throw new ValidationError(
        'Ya existe un paralelo con el mismo nombre, periodo y turno para esta carrera'
      );
    }
  }

  async execute(body = {}, userId = null) {
    const data = normalizeParaleloBody(body);
    assertParaleloPayload(data, { requireAll: true });

    await this.assertPeriodBelongsToCareer(data.careerId, data.periodId);
    await this.assertUnique(data.careerId, data.periodId, data.shift, data.name);

    const created = await this.parallelRepository.create(
      {
        careerId: data.careerId,
        periodId: data.periodId,
        name: data.name,
        shift: data.shift,
        description: data.description ?? null,
        active: data.active !== undefined ? data.active : true,
      },
      userId
    );

    this.logger.info('[CFG] Paralelo maestro creado', { id: created.id });
    return { paralelo: ParallelMapper.entityToPresentation(created) };
  }
}
