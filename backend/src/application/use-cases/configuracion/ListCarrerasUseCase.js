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
      collectionFieldName: 'careers',
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

