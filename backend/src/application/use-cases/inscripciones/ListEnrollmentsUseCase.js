/**
 * Use Case: ListEnrollmentsUseCase
 * Módulo: Inscripciones
 * Lista inscripciones con filtros, paginación y ordenamiento
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { EnrollmentMapper } from '../../mappers/inscripciones/index.js';

export class ListEnrollmentsUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.enrollmentRepository - Repositorio de inscripciones
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ enrollmentRepository, logger }) {
    super({
      repository: enrollmentRepository,
      logger,
      moduleName: 'Inscripciones',
      resourceName: 'inscripciones',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'enrollments',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'inscripciones',
    });
  }

  /**
   * Retorna el mapper a usar para convertir entidades Enrollment a presentación
   * @returns {EnrollmentMapper}
   */
  getMapper() {
    return EnrollmentMapper;
  }
}
