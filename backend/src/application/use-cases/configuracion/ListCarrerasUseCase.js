/**
 * Use Case: ListCarrerasUseCase
 * Módulo: Configuración
 * Lista carreras con filtros, paginación y ordenamiento
 */

export class ListCarrerasUseCase {
  constructor({ careerRepository, logger }) {
    this.careerRepository = careerRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.search - Búsqueda por código, nombre o descripción
   * @param {number} page - Número de página (default: 1)
   * @param {number} limit - Límite de resultados por página (default: 50)
   * @returns {Promise<{carreras: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(filters = {}, page = 1, limit = 50) {
    this.logger.info('[Configuración] Listando carreras', {
      filters,
      page,
      limit,
    });

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;

    // Obtener carreras con paginación
    const result = await this.careerRepository.findAll(
      filters,
      pageNum,
      limitNum
    );

    // Calcular total de páginas
    const totalPages = Math.ceil(result.total / limitNum);

    this.logger.info('[Configuración] Carreras listadas exitosamente', {
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      carrerasCount: result.careers?.length || 0,
    });

    return {
      carreras: result.careers || [],
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}

