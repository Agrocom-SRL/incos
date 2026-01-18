/**
 * Use Case: Obtener Todos los Métodos de Pago
 * 
 * Single Responsibility: Orquestar la obtención de todos los métodos de pago (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción IPaymentMethodRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Listar todos los métodos de pago
 * - Buscar métodos de pago (parámetro busqueda)
 * - Filtrar métodos de pago (parámetro filtros)
 * - Paginar resultados (parámetros pagina, limite)
 * - Ordenar resultados (parámetro ordenar)
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 * 
 * Ubicación: domain/useCases/pagos
 */

import { IPaymentMethodRepository } from '@repositories/IPaymentMethodRepository';

export class GetTodosPaymentMethodsUseCase {
  /**
   * @param {IPaymentMethodRepository} paymentMethodRepository - Repositorio de métodos de pago
   */
  constructor(paymentMethodRepository) {
    this.paymentMethodRepository = paymentMethodRepository;
  }

  /**
   * Ejecuta el caso de uso de obtener todos los métodos de pago
   * 
   * @param {Object} options - Opciones para obtener métodos de pago
   * @param {Object} options.params - Parámetros HTTP para el repositorio
   * @param {number} options.params.pagina - Número de página (paginación)
   * @param {number} options.params.limite - Cantidad por página (paginación)
   * @param {string} options.params.busqueda - Búsqueda general
   * @param {string} options.params.ordenar - Campo de ordenamiento (ej: "nombre", "-created_at")
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    const { params = {} } = options;

    try {
      // El repositorio hace la llamada HTTP con todos los params
      // GET /v1/metodos-pago?pagina=1&limite=10&busqueda=...&ordenar=nombre
      const result = await this.paymentMethodRepository.obtenerTodos({ params });
      
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
        error: error.message || 'Error al obtener métodos de pago',
      };
    }
  }
}
