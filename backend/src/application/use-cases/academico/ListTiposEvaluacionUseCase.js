import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { EvaluationTypePresentationMapper } from '../../mappers/academico/index.js';

/**
 * Catálogo de tipos de evaluación (tipos_evaluacion).
 */
export class ListTiposEvaluacionUseCase extends BaseListUseCase {
  constructor({ evaluationTypeRepository, logger }) {
    super({
      repository: evaluationTypeRepository,
      logger,
      moduleName: 'Calificaciones',
      resourceName: 'tipos de evaluación',
      collectionFieldName: 'evaluationTypes',
      dataFieldName: 'tiposEvaluacion',
    });
  }

  getMapper() {
    return EvaluationTypePresentationMapper;
  }

  buildSpecificFilters(queryParams = {}, baseFilters = {}) {
    return { ...baseFilters };
  }
}
