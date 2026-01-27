import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IContributionPaymentRepository
 * Define el contrato que debe cumplir el repositorio de pagos de aporte
 *
 * Métodos heredados de IRepository:
 * - findById(id)
 * - findBy(criteria, options)
 * - findAll(filters, page, limit)
 * - create(data, userId)
 * - update(id, data, userId)
 * - delete(id, userId)
 * - search(searchTerm, options)
 * - count(filters)
 *
 * Métodos específicos:
 * - obtenerListadoPagosAportes(baseFilters, page, limit, queryParams) - Listado desde vista_pago_aporte_listado
 */
export class IContributionPaymentRepository extends IRepository {
  /**
   * Obtiene el listado de pagos de aportes desde vista_pago_aporte_listado.
   * Retorna objetos planos (no entidades). El repositorio fusiona baseFilters + queryParams internamente.
   *
   * @param {Object} baseFilters - Filtros base (search, sort) de ListRequestDTO
   * @param {number} page - Página (1-based)
   * @param {number} limit - Límite por página
   * @param {Object} queryParams - Parámetros de query (gestion_id, estudiante_id, estado, etc.)
   * @returns {Promise<{contributionPayments: Array, total: number}>} Objetos planos según la vista
   */
  async obtenerListadoPagosAportes(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    throw new Error('Method obtenerListadoPagosAportes must be implemented by subclass');
  }
}
