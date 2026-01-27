/**
 * Use Case: Obtener Todos los Pagos de Aportes
 * 
 * Single Responsibility: Orquestar la obtención de todos los pagos de aportes (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción IPagoAporteRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Listar todos los pagos de aportes
 * - Buscar pagos (parámetro busqueda)
 * - Filtrar pagos (parámetro filtros)
 * - Paginar resultados (parámetros pagina, limite)
 * - Ordenar resultados (parámetro ordenar)
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 */

import { IPagoAporteRepository } from '@repositories/IPagoAporteRepository';

export class ObtenerTodosPagosAportesUseCase {
  /**
   * @param {IPagoAporteRepository} pagoAporteRepository - Repositorio de pagos de aportes
   */
  constructor(pagoAporteRepository) {
    this.pagoAporteRepository = pagoAporteRepository;
  }

  /**
   * Ejecuta el caso de uso de obtener todos los pagos de aportes (listado desde vista).
   *
   * @param {Object} options - Opciones para obtener pagos
   * @param {Object} options.params - Parámetros HTTP (alineados al backend: page, limit, search, sort, gestion_id, estudiante_id, estado)
   * @returns {Promise<{success: boolean, data?: Array, pagination?: {page, limit, total, totalPages}, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      const result = await this.pagoAporteRepository.obtenerTodos({ params });

      if (!result.success) {
        return result;
      }

      return {
        success: true,
        data: result.data || [],
        pagination: result.pagination || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener pagos de aportes',
      };
    }
  }
}
