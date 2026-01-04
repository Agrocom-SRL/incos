/**
 * Use Case: ListEstadosCivilesUseCase
 * Módulo: Referencia
 * Lista estados civiles con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { CivilStatusMapper } from '../../mappers/referencia/index.js';

export class ListEstadosCivilesUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.civilStatusRepository - Repositorio de estados civiles
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ civilStatusRepository, logger }) {
    super({
      repository: civilStatusRepository,
      logger,
      moduleName: 'Referencia',
      resourceName: 'estados civiles',
      collectionFieldName: 'civilStatuses',
      dataFieldName: 'estadosCiviles',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades CivilStatus a presentación
   * @returns {CivilStatusMapper}
   */
  getMapper() {
    return CivilStatusMapper;
  }
}

