/**
 * Use Case: ListMunicipiosUseCase
 * Módulo: Geográficos
 * Lista municipios con filtros, paginación y ordenamiento
 */

import { logger } from '../../../shared/logger.js';

export class ListMunicipiosUseCase {
  constructor({ municipalityRepository, logger: loggerInstance }) {
    this.municipalityRepository = municipalityRepository;
    this.logger = loggerInstance || logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.search - Búsqueda por nombre o código
   * @param {number} page - Número de página (default: 1)
   * @param {number} limit - Límite de resultados por página (default: 50)
   * @returns {Promise<{municipios: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(filters = {}, page = 1, limit = 50) {
    this.logger.info('[Geográficos] Listando municipios', {
      filters,
      page,
      limit,
    });

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;

    // Obtener municipios con paginación
    const result = await this.municipalityRepository.findAll(
      filters,
      pageNum,
      limitNum
    );

    // Calcular total de páginas
    const totalPages = Math.ceil(result.total / limitNum);

    this.logger.info('[Geográficos] Municipios listados exitosamente', {
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      municipiosCount: result.municipalities?.length || 0,
    });

    return {
      municipios: result.municipalities || [],
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}

