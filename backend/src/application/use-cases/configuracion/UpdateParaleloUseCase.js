import { NotFoundError } from '../../../domain/errors/AppError.js';
import { ParallelMapper } from '../../mappers/academico/index.js';
import { assertParaleloPayload, normalizeParaleloBody } from './paraleloPayload.js';
import { CreateParaleloUseCase } from './CreateParaleloUseCase.js';

export class UpdateParaleloUseCase {
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
    this._validator = new CreateParaleloUseCase({
      parallelRepository,
      periodRepository,
      studyPlanRepository,
      logger,
    });
  }

  async execute(id, body = {}, userId = null) {
    const current = await this.parallelRepository.findById(id);
    if (!current) {
      throw new NotFoundError('paralelo');
    }

    const patch = normalizeParaleloBody(body);
    assertParaleloPayload(patch, { requireAll: false });

    const next = {
      careerId: patch.careerId ?? current.careerId,
      periodId: patch.periodId ?? current.periodId,
      name: patch.name !== undefined && patch.name !== '' ? patch.name : current.name,
      shift: patch.shift ?? current.shift,
      description: patch.description !== undefined ? patch.description : current.description,
      active: patch.active !== undefined ? patch.active : current.active,
    };

    assertParaleloPayload(next, { requireAll: true });

    await this._validator.assertPeriodBelongsToCareer(next.careerId, next.periodId);
    await this._validator.assertUnique(next.careerId, next.periodId, next.shift, next.name, id);

    const updated = await this.parallelRepository.update(id, next, userId);
    if (!updated) {
      throw new NotFoundError('paralelo');
    }

    this.logger.info('[CFG] Paralelo maestro actualizado', { id });
    return { paralelo: ParallelMapper.entityToPresentation(updated) };
  }
}
