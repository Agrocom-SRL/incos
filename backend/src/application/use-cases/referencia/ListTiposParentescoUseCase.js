/**
 * Use Case: ListTiposParentescoUseCase
 * Módulo: Referencia
 * Lista tipos de parentesco con filtros, paginación y ordenamiento
 */

export class ListTiposParentescoUseCase {
  constructor({ relationshipTypeRepository, logger }) {
    this.relationshipTypeRepository = relationshipTypeRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.search - Búsqueda por nombre
   * @param {number} page - Número de página (default: 1)
   * @param {number} limit - Límite de resultados por página (default: 50)
   * @returns {Promise<{tiposParentesco: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(filters = {}, page = 1, limit = 50) {
    this.logger.info('[Referencia] Listando tipos de parentesco', {
      filters,
      page,
      limit,
    });

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;

    // Obtener tipos de parentesco con paginación
    const result = await this.relationshipTypeRepository.findAll(
      filters,
      pageNum,
      limitNum
    );

    // Calcular total de páginas
    const totalPages = Math.ceil(result.total / limitNum);

    this.logger.info('[Referencia] Tipos de parentesco listados exitosamente', {
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      tiposParentescoCount: result.relationshipTypes?.length || 0,
    });

    return {
      tiposParentesco: result.relationshipTypes || [],
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}

