/**
 * Use Case: ListProvinciasUseCase
 * Módulo: Geográficos
 * Lista provincias con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { ProvinceMapper } from '../../mappers/geograficos/index.js';

export class ListProvinciasUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.provinceRepository - Repositorio de provincias
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ provinceRepository, logger }) {
    super({
      repository: provinceRepository,
      logger,
      moduleName: 'Geográficos',
      resourceName: 'provincias',
      collectionFieldName: 'provinces',
      dataFieldName: 'provincias',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Province a presentación
   * @returns {ProvinceMapper}
   */
  getMapper() {
    return ProvinceMapper;
  }
}

