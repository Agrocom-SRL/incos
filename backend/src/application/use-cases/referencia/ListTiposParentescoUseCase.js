/**
 * Use Case: ListTiposParentescoUseCase
 * Módulo: Referencia
 * Lista tipos de parentesco con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { RelationshipTypeMapper } from '../../mappers/referencia/index.js';

export class ListTiposParentescoUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.relationshipTypeRepository - Repositorio de tipos de parentesco
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ relationshipTypeRepository, logger }) {
    super({
      repository: relationshipTypeRepository,
      logger,
      moduleName: 'Referencia',
      resourceName: 'tipos de parentesco',
      collectionFieldName: 'relationshipTypes',
      dataFieldName: 'tiposParentesco',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades RelationshipType a presentación
   * @returns {RelationshipTypeMapper}
   */
  getMapper() {
    return RelationshipTypeMapper;
  }
}

