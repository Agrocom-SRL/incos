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
    const filters = { ...baseFilters };

    if (queryParams.ambito) {
      filters.scopes = [String(queryParams.ambito).trim()];
    } else if (queryParams.scope) {
      filters.scopes = [String(queryParams.scope).trim()];
    }

    return filters;
  }
}
