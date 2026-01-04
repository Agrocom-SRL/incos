/**
 * Use Case: ListDiscapacidadUseCase
 * Módulo: Configuración
 * Lista tipos de discapacidad con filtros, paginación y ordenamiento
 */

export class ListDiscapacidadUseCase {
  constructor({ disabilityTypeRepository, logger }) {
    this.disabilityTypeRepository = disabilityTypeRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.search - Búsqueda por nombre o descripción
   * @param {number} page - Número de página (default: 1)
   * @param {number} limit - Límite de resultados por página (default: 50)
   * @returns {Promise<{discapacidades: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(filters = {}, page = 1, limit = 50) {
    this.logger.info('[Configuración] Listando tipos de discapacidad', {
      filters,
      page,
      limit,
    });

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;

    // Obtener tipos de discapacidad con paginación
    const result = await this.disabilityTypeRepository.findAll(
      filters,
      pageNum,
      limitNum
    );

    // Calcular total de páginas
    const totalPages = Math.ceil(result.total / limitNum);

    this.logger.info('[Configuración] Tipos de discapacidad listados exitosamente', {
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      discapacidadesCount: result.disabilityTypes?.length || 0,
    });

    return {
      discapacidades: result.disabilityTypes || [],
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}

