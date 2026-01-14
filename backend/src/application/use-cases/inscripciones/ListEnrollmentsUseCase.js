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
      collectionFieldName: 'enrollments',
      dataFieldName: 'enrollments',
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
