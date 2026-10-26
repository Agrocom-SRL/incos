import { parseFechaISO, parseFiltroId } from '../../../utils/validacionEntrada.js';
import { FichaSeguimientoMapper } from '../../../mappers/docentes/FichaSeguimientoMapper.js';

/**
 * Use Case: ListFichasSeguimientoUseCase (S1)
 * Módulo: Docentes (DOC · supervisión docente)
 *
 * Lista fichas de seguimiento en clase desde la vista 174
 * (vista_supervision_fichas_listado) con filtros y paginación.
 *
 * Contrato compatible con BaseListController:
 * execute(baseFilters, page, limit, queryParams) →
 * { fichasSeguimiento, total, page, limit, totalPages }.
 */
export class ListFichasSeguimientoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.fichaSeguimientoListadoViewRepository - Vista 174
   * @param {ILogger} params.logger
   */
  constructor({ fichaSeguimientoListadoViewRepository, logger }) {
    this.fichaSeguimientoListadoViewRepository = fichaSeguimientoListadoViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} baseFilters - { search } normalizados por ListRequestDTO
   * @param {number} page
   * @param {number} limit
   * @param {Object} queryParams - docenteId, gestionId, fechaDesde, fechaHasta
   * @returns {Promise<{fichasSeguimiento: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const filters = {
      search: baseFilters.search,
      docenteId: parseFiltroId(queryParams.docenteId, 'docenteId'),
      gestionId: parseFiltroId(queryParams.gestionId, 'gestionId'),
      fechaDesde: queryParams.fechaDesde ? parseFechaISO(queryParams.fechaDesde, 'fechaDesde') : undefined,
      fechaHasta: queryParams.fechaHasta ? parseFechaISO(queryParams.fechaHasta, 'fechaHasta') : undefined,
    };

    const { rows, total } = await this.fichaSeguimientoListadoViewRepository.findListado(
      filters,
      pageNum,
      limitNum
    );

    this.logger.info('[Supervisión docente] Fichas listadas', { total, count: rows.length });

    return {
      fichasSeguimiento: FichaSeguimientoMapper.listadoRowsToPresentation(rows),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }
}
