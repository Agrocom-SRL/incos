/**
 * Use Case: ListDocumentacionUseCase
 * Módulo: Referencia
 * Lista tipos de documentación con filtros, paginación y ordenamiento
 */

export class ListDocumentacionUseCase {
  constructor({ documentacionRepository, logger }) {
    this.documentacionRepository = documentacionRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.search - Búsqueda por nombre o descripción
   * @param {number} page - Número de página (default: 1)
   * @param {number} limit - Límite de resultados por página (default: 50)
   * @returns {Promise<{documentacion: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(filters = {}, page = 1, limit = 50) {
    this.logger.info('[Referencia] Listando tipos de documentación', {
      filters,
      page,
      limit,
    });

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;

    // Obtener tipos de documentación con paginación
    const result = await this.documentacionRepository.findAll(
      filters,
      pageNum,
      limitNum
    );

    // Calcular total de páginas
    const totalPages = Math.ceil(result.total / limitNum);

    this.logger.info('[Referencia] Tipos de documentación listados exitosamente', {
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      documentacionCount: result.documentaciones?.length || 0,
    });

    return {
      documentacion: result.documentaciones || [],
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}

