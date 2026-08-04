import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { StudyPlanMapper } from '../../mappers/configuracion/index.js';

export class ListPlanesEstudiosUseCase extends BaseListUseCase {
  constructor({ studyPlanRepository, logger }) {
    super({
      repository: studyPlanRepository,
      logger,
      moduleName: 'Configuración',
      resourceName: 'planes de estudio',
      collectionFieldName: 'studyPlans',
      dataFieldName: 'planes_estudios',
    });
  }

  getMapper() {
    return StudyPlanMapper;
  }

  /**
   * incluirInactivos → includeInactive (mismo patrón que ListEstadosCivilesUseCase/
   * ListAulasUseCase): BaseRepository deja de filtrar por activo=true. Lo usa el
   * catálogo de Planes (con toggle de estado); otros consumidores (ej. selector de
   * plan al crear paralelo) siguen viendo solo activos por defecto.
   * @param {Object} queryParams - Query parameters de Express (req.query)
   * @param {Object} baseFilters - Filtros base ya extraídos por ListRequestDTO (search, sort)
   * @returns {Object} Filtros combinados con filtros específicos normalizados
   */
  buildSpecificFilters(queryParams = {}, baseFilters = {}) {
    const filters = { ...baseFilters };

    if (queryParams.incluirInactivos !== undefined) {
      filters.includeInactive =
        queryParams.incluirInactivos === 'true' || queryParams.incluirInactivos === true;
    }

    return filters;
  }
}
