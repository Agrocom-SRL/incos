/**
 * Use Case: ListStudentsUseCase
 * Módulo: Estudiantes
 * Lista estudiantes con filtros, paginación y ordenamiento
 */

import { logger } from '../../../shared/logger.js';
import { StudentMapper } from '../../mappers/StudentMapper.js';

export class ListStudentsUseCase {
  constructor({ studentRepository, logger: loggerInstance }) {
    this.studentRepository = studentRepository;
    this.logger = loggerInstance || logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.search - Búsqueda por código, nombre, CI, email o celular
   * @param {string} filters.estado - Estado del estudiante
   * @param {string} filters.sort - Ordenamiento
   * @param {number} page - Número de página (default: 1)
   * @param {number} limit - Límite de resultados por página (default: 50)
   * @returns {Promise<{students: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(filters = {}, page = 1, limit = 50) {
    this.logger.info('[Estudiantes] Listando estudiantes', {
      filters,
      page,
      limit,
    });

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;

    // Obtener estudiantes con paginación
    const result = await this.studentRepository.findAll(
      filters,
      pageNum,
      limitNum
    );

    // Convertir entidades a formato de presentación (castellano)
    const estudiantesData = StudentMapper.entitiesToPresentation(
      result.students || []
    );

    // Calcular total de páginas
    const totalPages = Math.ceil(result.total / limitNum);

    this.logger.info('[Estudiantes] Estudiantes listados exitosamente', {
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      estudiantesCount: estudiantesData.length,
    });

    return {
      students: estudiantesData,
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}

