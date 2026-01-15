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
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'civilStatuses',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
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

