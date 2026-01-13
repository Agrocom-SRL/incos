/**
 * Use Case: SearchStudentUseCase
 * Módulo: Estudiantes
 * Busca estudiantes por texto libre
 * 
 * Busca en: codigo_estudiante, ci, apellido_paterno, apellido_materno, nombres
 * (campos definidos en StudentRepository.getSearchFields())
 * 
 * Usa StudentMapper para convertir entidades a formato de presentación (campos en español)
 * manteniendo consistencia con ListStudentsUseCase
 */
import { BaseSearchUseCase } from '../base/BaseSearchUseCase.js';
import { StudentMapper } from '../../mappers/estudiantes/index.js';

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

  /**
   * Retorna el mapper a usar para convertir entidades Student a presentación
   * @returns {StudentMapper}
   */
  getMapper() {
    return StudentMapper;
  }
}
