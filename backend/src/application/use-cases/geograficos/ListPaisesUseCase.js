/**
 * Use Case: ListPaisesUseCase
 * Módulo: Geográficos
 * Lista países con filtros, paginación y ordenamiento
 */

import { logger } from '../../../shared/logger.js';

export class ListPaisesUseCase {
  constructor({ countryRepository, logger: loggerInstance }) {
    this.countryRepository = countryRepository;
    this.logger = loggerInstance || logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.search - Búsqueda por nombre o código ISO
   * @param {number} page - Número de página (default: 1)
   * @param {number} limit - Límite de resultados por página (default: 50)
   * @returns {Promise<{paises: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(filters = {}, page = 1, limit = 50) {
    this.logger.info('[Geográficos] Listando países', {
      filters,
      page,
      limit,
    });

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;

    // Obtener países con paginación
    const result = await this.countryRepository.findAll(
      filters,
      pageNum,
      limitNum
    );

    // Calcular total de páginas
    const totalPages = Math.ceil(result.total / limitNum);

    this.logger.info('[Geográficos] Países listados exitosamente', {
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      paisesCount: result.countries?.length || 0,
    });

    return {
      paises: result.countries || [],
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}

