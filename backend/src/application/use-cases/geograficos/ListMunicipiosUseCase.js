/**
 * Use Case: ListMunicipiosUseCase
 * Módulo: Geográficos
 * Lista municipios con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { MunicipalityMapper } from '../../mappers/geograficos/index.js';

export class ListMunicipiosUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.municipalityRepository - Repositorio de municipios
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ municipalityRepository, logger }) {
    super({
      repository: municipalityRepository,
      logger,
      moduleName: 'Geográficos',
      resourceName: 'municipios',
      collectionFieldName: 'municipalities',
      dataFieldName: 'municipios',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Municipality a presentación
   * @returns {MunicipalityMapper}
   */
  getMapper() {
    return MunicipalityMapper;
  }
}

