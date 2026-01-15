/**
 * Use Case: ListDiscapacidadUseCase
 * Módulo: Referencia
 * Lista tipos de discapacidad con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { DisabilityTypeMapper } from '../../mappers/referencia/index.js';

export class ListDiscapacidadUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.disabilityTypeRepository - Repositorio de tipos de discapacidad
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ disabilityTypeRepository, logger }) {
    super({
      repository: disabilityTypeRepository,
      logger,
      moduleName: 'Referencia',
      resourceName: 'tipos de discapacidad',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'disabilityTypes',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'discapacidades',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades DisabilityType a presentación
   * @returns {DisabilityTypeMapper}
   */
  getMapper() {
    return DisabilityTypeMapper;
  }
}

