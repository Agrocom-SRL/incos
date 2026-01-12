/**
 * Use Case: SearchStudentUseCase
 * Módulo: Estudiantes
 * Busca estudiantes por texto libre
 * 
 * Busca en: codigo_estudiante, ci, apellido_paterno, apellido_materno, nombres
 * (campos definidos en StudentRepository.getSearchFields())
 */
import { BaseSearchUseCase } from '../base/BaseSearchUseCase.js';

export class SearchStudentUseCase extends BaseSearchUseCase {
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
      resourceName: 'estudiante',
    });
  }
}
