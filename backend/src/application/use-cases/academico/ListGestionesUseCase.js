/**
 * Use Case: ListGestionesUseCase
 * Módulo: Académico
 * Lista gestiones académicas con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { ManagementMapper } from '../../mappers/academico/ManagementMapper.js';

export class ListGestionesUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.managementRepository - Repositorio de gestiones
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ managementRepository, logger }) {
    super({
      repository: managementRepository,
      logger,
      moduleName: 'Académico',
      resourceName: 'gestiones',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'managements',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'gestiones',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Management a presentación
   * @returns {ManagementMapper}
   */
  getMapper() {
    return ManagementMapper;
  }
}
