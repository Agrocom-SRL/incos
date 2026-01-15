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
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'students',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'estudiantes',
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

