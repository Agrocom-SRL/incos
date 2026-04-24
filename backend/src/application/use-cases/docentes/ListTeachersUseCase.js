/**
 * Use Case: ListTeachersUseCase
 * Lista docentes desde la tabla docentes con búsqueda, orden y paginación estándar.
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { TeacherListMapper } from '../../mappers/docentes/TeacherListMapper.js';

export class ListTeachersUseCase extends BaseListUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.teacherRepository - Repositorio de docentes (TeacherRepository)
   * @param {Object} params.logger
   */
  constructor({ teacherRepository, logger }) {
    super({
      repository: teacherRepository,
      logger,
      moduleName: 'Docentes',
      resourceName: 'docentes',
      collectionFieldName: 'teachers',
      dataFieldName: 'docentes',
    });
  }

  getMapper() {
    return TeacherListMapper;
  }
}
