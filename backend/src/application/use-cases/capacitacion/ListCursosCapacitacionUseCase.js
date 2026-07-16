import { CursoCapacitacionMapper } from '../../mappers/capacitacion/index.js';

/**
 * Use Case: ListCursosCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Lista cursos de capacitación desde la vista 155
 * (`vista_cursos_capacitacion_listado`) con filtros, paginación y agregados
 * (inscritos_count, cupo_disponible, horarios_detalle).
 *
 * Contrato compatible con BaseListController:
 * execute(baseFilters, page, limit, queryParams) →
 * { cursosCapacitacion, total, page, limit, totalPages }.
 *
 * Filtros específicos: estado, incluirInactivos (el listado soporta el switch
 * activar/desactivar del patrón EstadoTogglePill).
 */
export class ListCursosCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.cursoCapacitacionFichaViewRepository - Repo de lectura (vistas 154/155)
   * @param {ILogger} params.logger
   */
  constructor({ cursoCapacitacionFichaViewRepository, logger }) {
    this.cursoCapacitacionFichaViewRepository = cursoCapacitacionFichaViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} baseFilters - { search, sort } normalizados por ListRequestDTO
   * @param {number} page
   * @param {number} limit
   * @param {Object} queryParams - Query params originales (estado, incluirInactivos)
   * @returns {Promise<{cursosCapacitacion: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    const filters = {
      search: baseFilters.search,
      estado: queryParams.estado || undefined,
      includeInactive:
        queryParams.incluirInactivos === 'true' || queryParams.incluirInactivos === true,
    };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    this.logger.info('[Capacitación] Iniciando listado de cursos de capacitación', {
      filters,
      page: pageNum,
      limit: limitNum,
    });

    const { rows, total } = await this.cursoCapacitacionFichaViewRepository.findListado(
      filters,
      pageNum,
      limitNum
    );

    const totalPages = Math.ceil(total / limitNum);

    this.logger.info('[Capacitación] Cursos de capacitación listados exitosamente', {
      total,
      count: rows.length,
    });

    return {
      cursosCapacitacion: CursoCapacitacionMapper.viewRowsToPresentation(rows),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}
