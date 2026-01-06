/**
 * Request DTO genérico: ListRequestDTO
 * 
 * Transforma y normaliza los query parameters comunes para operaciones de listado.
 * Usado por todos los módulos que implementan listado (países, departamentos, carreras, etc.)
 * 
 * Query Parameters comunes:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50, max: 100)
 * - search: Término de búsqueda general (opcional)
 * 
 * Use Case espera:
 * - filters: { search?, ...filtrosEspecificos }
 * - page: number
 * - limit: number
 * 
 * Clean Architecture:
 * - Application Layer: Transforma datos de Presentation → Application
 * - Depende solo de estructuras de datos, no de entidades de dominio
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo transforma y normaliza query parameters comunes
 * - DRY: Evita duplicación entre módulos
 * - Open/Closed: Extensible para agregar filtros específicos en subclases o métodos adicionales
 * 
 * NOTA: Este DTO es genérico y solo maneja parámetros comunes.
 * Los filtros específicos de cada módulo se agregan en el controller mediante buildFilters().
 */
export class ListRequestDTO {
  /**
   * Transforma los query parameters del request a la estructura que espera el use case
   * 
   * @param {Object} query - Query parameters de Express (req.query)
   * @returns {Object} Objeto con filtros, page y limit para el use case
   */
  static fromQuery(query) {
    // 1. Extraer y normalizar paginación
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 50;

    // Validar valores mínimos y máximos
    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.min(Math.max(1, limit), 100); // Máximo 100 por página

    // 2. Construir filtros básicos (solo search, filtros específicos se agregan en buildFilters)
    const filters = {};

    // Filtro de búsqueda general
    if (query.search && typeof query.search === 'string') {
      filters.search = query.search.trim();
    }

    return {
      filters,
      page: normalizedPage,
      limit: normalizedLimit,
    };
  }
}

