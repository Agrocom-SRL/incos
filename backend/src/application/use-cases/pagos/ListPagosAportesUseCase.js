/**
 * Use Case: ListPagosAportesUseCase
 * Módulo: Pagos
 * Lista cabeceras de aporte (pago_aporte) con filtros, paginación y ordenamiento.
 *
 * Usa vista_pago_aporte_listado. El repositorio fusiona baseFilters + queryParams y delega
 * COUNT + SELECT en BaseRepository._queryViewPaged.
 * Contrato con el controller: execute(baseFilters, page, limit, queryParams)
 * → { pagos, total, page, limit, totalPages }
 *
 * No hereda BaseListUseCase porque la implementación es distinta (vista en lugar de tabla + enrich).
 * El mapeo fila vista → presentación está en ContributionPaymentMapper.entitiesToPresentation.
 */

import { ContributionPaymentMapper } from '../../mappers/pagos/index.js';

export class ListPagosAportesUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.contributionPaymentRepository - Repositorio (debe tener obtenerListadoPagosAportes)
   * @param {ILogger} params.logger - Logger
   */
  constructor({ contributionPaymentRepository, logger }) {
    if (!contributionPaymentRepository) throw new Error('contributionPaymentRepository es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.repository = contributionPaymentRepository;
    this.logger = logger;
  }

  /**
   * Lista pagos de aportes desde vista_pago_aporte_listado.
   * Misma firma que BaseListUseCase.execute para el controller.
   *
   * @param {Object} baseFilters - Filtros base (search, sort) de ListRequestDTO
   * @param {number} page - Página (1-based)
   * @param {number} limit - Límite por página
   * @param {Object} queryParams - req.query (gestion_id, estudiante_id, estado, etc.)
   * @returns {Promise<{pagos: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;

    this.logger.info('[Pagos] Iniciando listado de pagos de aportes (vista)', {
      baseFilters,
      queryParams,
      page: pageNum,
      limit: limitNum,
    });

    try {
      const result = await this.repository.obtenerListadoPagosAportes(baseFilters, pageNum, limitNum, queryParams);
      const rows = result.contributionPayments || [];
      const total = result.total ?? 0;

      const pagos = ContributionPaymentMapper.entitiesToPresentation(rows);
      const totalPages = Math.ceil(total / limitNum);

      this.logger.info('[Pagos] Pagos de aportes listados exitosamente (vista)', {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        count: pagos.length,
      });

      return {
        pagos,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      };
    } catch (error) {
      this.logger.error('[Pagos] Error al listar pagos de aportes', {
        error: error.message,
        stack: error.stack,
        baseFilters,
        queryParams,
        page: pageNum,
        limit: limitNum,
      });
      throw error;
    }
  }
}
