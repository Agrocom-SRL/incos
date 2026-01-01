/**
 * Use Case: ListIdiomasUseCase
 * Módulo: Referencia
 * Lista idiomas con filtros, paginación y ordenamiento
 */

import { logger } from '../../../shared/logger.js';

export class ListIdiomasUseCase {
  constructor({ languageRepository, logger: loggerInstance }) {
    this.languageRepository = languageRepository;
    this.logger = loggerInstance || logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.search - Búsqueda por nombre
   * @param {number} page - Número de página (default: 1)
   * @param {number} limit - Límite de resultados por página (default: 50)
   * @returns {Promise<{idiomas: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(filters = {}, page = 1, limit = 50) {
    this.logger.info('[Referencia] Listando idiomas', {
      filters,
      page,
      limit,
    });

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;

    // Obtener idiomas con paginación
    const result = await this.languageRepository.findAll(
      filters,
      pageNum,
      limitNum
    );

    // Calcular total de páginas
    const totalPages = Math.ceil(result.total / limitNum);

    this.logger.info('[Referencia] Idiomas listados exitosamente', {
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      idiomasCount: result.languages?.length || 0,
    });

    return {
      idiomas: result.languages || [],
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}

