/**
 * Use Case: ListIdiomasUseCase
 * Módulo: Referencia
 * Lista idiomas con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { LanguageMapper } from '../../mappers/referencia/index.js';

export class ListIdiomasUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.languageRepository - Repositorio de idiomas
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ languageRepository, logger }) {
    super({
      repository: languageRepository,
      logger,
      moduleName: 'Referencia',
      resourceName: 'idiomas',
      collectionFieldName: 'languages',
      dataFieldName: 'idiomas',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Language a presentación
   * @returns {LanguageMapper}
   */
  getMapper() {
    return LanguageMapper;
  }
}

