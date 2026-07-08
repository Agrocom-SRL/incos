import { EvaluationTypePresentationMapper } from '../../mappers/academico/index.js';

export class GetTipoEvaluacionByIdUseCase {
  constructor({ evaluationTypeRepository, logger }) {
    this.evaluationTypeRepository = evaluationTypeRepository;
    this.logger = logger;
  }

  async execute(id) {
    const entity = await this.evaluationTypeRepository.findById(id, { paranoid: false });
    if (!entity) return null;

    return EvaluationTypePresentationMapper.entityToPresentation(entity);
  }
}
