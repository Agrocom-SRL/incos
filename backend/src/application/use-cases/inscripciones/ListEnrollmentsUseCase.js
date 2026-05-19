/**
 * Use Case: ListEnrollmentsUseCase
 * Módulo: Inscripciones / Matrícula
 * Lista matrículas desde vista_base_matricula_resumen_inscripcion (estudiante, carrera, gestión,
 * cantidad de materias e historial previo en una sola consulta).
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { EnrollmentMapper } from '../../mappers/inscripciones/index.js';

export class ListEnrollmentsUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.enrollmentRepository - Repositorio (obtenerListadoMatriculas)
   * @param {ILogger} params.logger
   */
  constructor({
    enrollmentRepository,
    subjectEnrollmentRepository,
    studentAcademicDataRepository,
    studentRepository,
    careerRepository,
    managementRepository,
    priorEnrollmentHistoryRepository,
    logger,
  }) {
    super({
      repository: enrollmentRepository,
      logger,
      moduleName: 'Inscripciones',
      resourceName: 'inscripciones',
      collectionFieldName: 'enrollments',
      dataFieldName: 'inscripciones',
    });
  }

  getMapper() {
    return EnrollmentMapper;
  }

  /**
   * Listado vía vista_base_matricula_resumen_inscripcion (datos ya agregados en SQL).
   * @override
   */
  async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    const initialFilters = Object.keys(queryParams).length > 0
      ? this.buildSpecificFilters(queryParams, baseFilters)
      : baseFilters;
    const filters = await this.prepareFilters(initialFilters, queryParams);
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;

    this.logger.info(`[${this.moduleName}] Iniciando listado de ${this.resourceName} (vista)`, {
      filters,
      page: pageNum,
      limit: limitNum,
    });

    try {
      const result = await this.repository.obtenerListadoMatriculas(
        filters,
        pageNum,
        limitNum,
        queryParams
      );
      const data = EnrollmentMapper.viewRowsToPresentation(result.enrollments || []);
      const enrichedData = await this.enrichData(data, result);
      const total = result.total ?? 0;
      const totalPages = Math.ceil(total / limitNum);

      this.logger.info(`[${this.moduleName}] ${this.resourceName} listados exitosamente (vista)`, {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        count: enrichedData.length,
      });

      return {
        [this.dataFieldName]: enrichedData,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      };
    } catch (error) {
      this.logger.error(`[${this.moduleName}] Error al listar ${this.resourceName}`, {
        error: error.message,
        stack: error.stack,
        filters,
        page: pageNum,
        limit: limitNum,
      });
      throw error;
    }
  }
}
