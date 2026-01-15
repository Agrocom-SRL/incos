/**
 * Use Case: ListBecasDescuentosUseCase
 * Módulo: Estudiantes
 * Lista becas y descuentos con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { BecaDescuentoMapper } from '../../mappers/estudiantes/index.js';

export class ListBecasDescuentosUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.scholarshipRepository - Repositorio de becas y descuentos
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ scholarshipRepository, logger }) {
    super({
      repository: scholarshipRepository,
      logger,
      moduleName: 'Estudiantes',
      resourceName: 'becas y descuentos',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'scholarships',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'becasDescuentos',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Scholarship a presentación
   * @returns {BecaDescuentoMapper}
   */
  getMapper() {
    return BecaDescuentoMapper;
  }
}
