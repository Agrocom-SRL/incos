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
   * Ejecuta el caso de uso de obtener todos los pagos de aportes
   * 
   * @param {Object} options - Opciones para obtener pagos
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @param {number} options.params.pagina - Número de página (paginación)
   * @param {number} options.params.limite - Cantidad por página (paginación)
   * @param {string} options.params.busqueda - Búsqueda general
   * @param {number} options.params.student_id - Filtro por ID de estudiante
   * @param {number} options.params.management_id - Filtro por ID de gestión
   * @param {string} options.params.ordenar - Campo de ordenamiento (ej: "fecha_pago", "-created_at")
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      // El repositorio hace la llamada HTTP con todos los params
      // GET /v1/pagos-aportes?pagina=1&limite=10&busqueda=...&student_id=1&ordenar=fecha_pago
      const result = await this.pagoAporteRepository.obtenerTodos({ params });
      
      // Si hay error en el repositorio, retornarlo
      if (!result.success) {
        return result;
      }

      // Retornar datos directamente del backend
      // No hay lógica adicional de negocio en este caso
      return {
        success: true,
        data: result.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener pagos de aportes',
      };
    }
  }
}
