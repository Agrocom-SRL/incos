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

    // incluirInactivos → includeInactive (mismo patrón que ListAulasUseCase /
    // catálogos de referencia): permite administrar ítems desactivados desde CFG.
    // El combo del cuaderno de calificaciones no envía el flag → sigue viendo solo activos.
    if (queryParams.incluirInactivos !== undefined) {
      filters.includeInactive =
        queryParams.incluirInactivos === 'true' || queryParams.incluirInactivos === true;
    }

    return filters;
  }
}
