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
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'relationshipTypes',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
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

