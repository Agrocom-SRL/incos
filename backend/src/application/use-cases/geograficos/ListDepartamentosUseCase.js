/**
 * Use Case: ListDepartamentosUseCase
 * Módulo: Geográficos
 * Lista departamentos con filtros, paginación y ordenamiento
 */

export class ListDepartamentosUseCase {
  constructor({ departmentRepository, logger }) {
    this.departmentRepository = departmentRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.search - Búsqueda por nombre o código
   * @param {number} page - Número de página (default: 1)
   * @param {number} limit - Límite de resultados por página (default: 50)
   * @returns {Promise<{departamentos: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(filters = {}, page = 1, limit = 50) {
    this.logger.info('[Geográficos] Listando departamentos', {
      filters,
      page,
      limit,
    });

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;

    // Obtener departamentos con paginación
    const result = await this.departmentRepository.findAll(
      filters,
      pageNum,
      limitNum
    );

    // Calcular total de páginas
    const totalPages = Math.ceil(result.total / limitNum);

    this.logger.info('[Geográficos] Departamentos listados exitosamente', {
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      departamentosCount: result.departments?.length || 0,
    });

    return {
      departamentos: result.departments || [],
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}

