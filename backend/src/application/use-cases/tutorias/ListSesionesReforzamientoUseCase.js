import { SesionReforzamientoMapper } from '../../mappers/tutorias/index.js';

/**
 * Use Case: ListSesionesReforzamientoUseCase (A4)
 * Módulo: Tutorías (TUT · acompañamiento)
 *
 * Lista sesiones de reforzamiento (vista 161) con filtros y paginación.
 * Contrato compatible con BaseListController:
 * execute(baseFilters, page, limit, queryParams) →
 * { sesionesReforzamiento, total, page, limit, totalPages }.
 */
export class ListSesionesReforzamientoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.acompanamientoSesionViewRepository - Vistas 161/162
   * @param {ILogger} params.logger
   */
  constructor({ acompanamientoSesionViewRepository, logger }) {
    this.acompanamientoSesionViewRepository = acompanamientoSesionViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} baseFilters - { search }
   * @param {number} page
   * @param {number} limit
   * @param {Object} queryParams - gestionId, docenteId, asignacionDocenteId, estado, modalidad
   * @returns {Promise<{sesionesReforzamiento: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const filters = {
      search: baseFilters.search,
      gestionId: queryParams.gestionId ? Number(queryParams.gestionId) : undefined,
      docenteId: queryParams.docenteId ? Number(queryParams.docenteId) : undefined,
      asignacionDocenteId: queryParams.asignacionDocenteId
        ? Number(queryParams.asignacionDocenteId)
        : undefined,
      estado: queryParams.estado || undefined,
      modalidad: queryParams.modalidad || undefined,
    };

    const { rows, total } = await this.acompanamientoSesionViewRepository.findSesiones(
      filters,
      pageNum,
      limitNum
    );

    this.logger.info('[Tutorías] Sesiones de reforzamiento listadas', {
      total,
      count: rows.length,
    });

    return {
      sesionesReforzamiento: SesionReforzamientoMapper.viewRowsToPresentation(rows),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }
}
