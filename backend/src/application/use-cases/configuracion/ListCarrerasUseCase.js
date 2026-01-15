/**
 * Use Case: ListCarrerasUseCase
 * Módulo: Configuración
 * Lista carreras con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { CareerMapper } from '../../mappers/configuracion/index.js';

export class ListCarrerasUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.careerRepository - Repositorio de carreras
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ careerRepository, logger }) {
    super({
      repository: careerRepository,
      logger,
      moduleName: 'Configuración',
      resourceName: 'carreras',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'careers',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'carreras',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Career a presentación
   * @returns {CareerMapper}
   */
  getMapper() {
    return CareerMapper;
  }
}

