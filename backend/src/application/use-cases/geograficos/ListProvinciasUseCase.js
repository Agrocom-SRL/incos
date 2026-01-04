/**
 * Use Case: ListProvinciasUseCase
 * Módulo: Geográficos
 * Lista provincias con filtros, paginación y ordenamiento
 */

export class ListProvinciasUseCase {
  constructor({ provinceRepository, logger }) {
    this.provinceRepository = provinceRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.search - Búsqueda por nombre o código
   * @param {number} page - Número de página (default: 1)
   * @param {number} limit - Límite de resultados por página (default: 50)
   * @returns {Promise<{provincias: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(filters = {}, page = 1, limit = 50) {
    this.logger.info('[Geográficos] Listando provincias', {
      filters,
      page,
      limit,
    });

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;

    // Obtener provincias con paginación
    const result = await this.provinceRepository.findAll(
      filters,
      pageNum,
      limitNum
    );

    // Calcular total de páginas
    const totalPages = Math.ceil(result.total / limitNum);

    this.logger.info('[Geográficos] Provincias listadas exitosamente', {
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      provinciasCount: result.provinces?.length || 0,
    });

    return {
      provincias: result.provinces || [],
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}

