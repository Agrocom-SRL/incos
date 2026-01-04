/**
 * Use Case: ListMateriasUseCase
 * Módulo: Configuración
 * Lista materias con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { SubjectMapper } from '../../mappers/configuracion/index.js';

export class ListMateriasUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.subjectRepository - Repositorio de materias
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ subjectRepository, logger }) {
    super({
      repository: subjectRepository,
      logger,
      moduleName: 'Configuración',
      resourceName: 'materias',
      collectionFieldName: 'subjects',
      dataFieldName: 'materias',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Subject a presentación
   * @returns {SubjectMapper}
   */
  getMapper() {
    return SubjectMapper;
  }
}

