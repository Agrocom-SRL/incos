/**
 * Use Case: ListMateriasUseCase
 * Módulo: Configuración
 * Lista materias con filtros, paginación y ordenamiento
 */

export class ListMateriasUseCase {
  constructor({ subjectRepository, logger }) {
    this.subjectRepository = subjectRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.search - Búsqueda por código, nombre, nombre corto o descripción
   * @param {number} page - Número de página (default: 1)
   * @param {number} limit - Límite de resultados por página (default: 50)
   * @returns {Promise<{materias: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(filters = {}, page = 1, limit = 50) {
    this.logger.info('[Configuración] Listando materias', {
      filters,
      page,
      limit,
    });

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;

    // Obtener materias con paginación
    const result = await this.subjectRepository.findAll(
      filters,
      pageNum,
      limitNum
    );

    // Calcular total de páginas
    const totalPages = Math.ceil(result.total / limitNum);

    this.logger.info('[Configuración] Materias listadas exitosamente', {
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      materiasCount: result.subjects?.length || 0,
    });

    return {
      materias: result.subjects || [],
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}

