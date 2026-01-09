/**
 * Use Case: ListDocumentacionUseCase
 * Módulo: Referencia
 * Lista tipos de documentación con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { DocumentacionMapper } from '../../mappers/referencia/index.js';

export class ListDocumentacionUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.documentacionRepository - Repositorio de tipos de documentación
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ documentacionRepository, logger }) {
    super({
      repository: documentacionRepository,
      logger,
      moduleName: 'Referencia',
      resourceName: 'tipos de documentación',
      collectionFieldName: 'documentaciones',
      dataFieldName: 'documentacion',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Documentation a presentación
   * @returns {DocumentacionMapper}
   */
  getMapper() {
    return DocumentacionMapper;
  }
}

