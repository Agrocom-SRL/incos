/**
 * Use Case: ListStudentsUseCase
 * Módulo: Estudiantes
 * Lista estudiantes con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { StudentMapper } from '../../mappers/estudiantes/index.js';

export class ListStudentsUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ studentRepository, logger }) {
    super({
      repository: studentRepository,
      logger,
      moduleName: 'Estudiantes',
      resourceName: 'estudiantes',
      collectionFieldName: 'students',
      dataFieldName: 'students',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Student a presentación
   * @returns {StudentMapper}
   */
  getMapper() {
    return StudentMapper;
  }
}

