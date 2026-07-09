import { EvaluationTypePresentationMapper } from '../../mappers/academico/index.js';

export class GetTipoEvaluacionByIdUseCase {
  constructor({ evaluationTypeRepository, logger }) {
    this.evaluationTypeRepository = evaluationTypeRepository;
    this.logger = logger;
  }

  async execute(id) {
    const entity = await this.evaluationTypeRepository.findById(id, { paranoid: false });
    if (!entity) return null;

    const presentation = EvaluationTypePresentationMapper.entityToPresentation(entity);

    // Dato informativo de la ficha del catálogo: cuántas evaluaciones
    // (columnas del cuaderno) usan este tipo. Conteo simple, sin vista SQL.
    const cantidadEvaluaciones = await this.evaluationTypeRepository.contarPorTipoEvaluacion(id);

    return { ...presentation, cantidadEvaluaciones };
  }
}
