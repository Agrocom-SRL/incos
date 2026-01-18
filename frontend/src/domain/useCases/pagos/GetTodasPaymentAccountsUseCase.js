/**
 * Use Case: Obtener Todas las Cuentas de Pago
 * 
 * Single Responsibility: Orquestar la obtención de todas las cuentas de pago (listar, buscar, filtrar, paginar)
 * Dependency Inversion: Depende de la abstracción IPaymentAccountRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Listar todas las cuentas de pago
 * - Buscar cuentas de pago (parámetro busqueda)
 * - Filtrar cuentas de pago (parámetro filtros)
 * - Paginar resultados (parámetros pagina, limite)
 * - Ordenar resultados (parámetro ordenar)
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 * 
 * Ubicación: domain/useCases/pagos
 */

import { IPaymentAccountRepository } from '@repositories/IPaymentAccountRepository';

export class GetTodasPaymentAccountsUseCase {
  /**
   * @param {IPaymentAccountRepository} paymentAccountRepository - Repositorio de cuentas de pago
   */
  constructor(paymentAccountRepository) {
    this.paymentAccountRepository = paymentAccountRepository;
  }

  /**
   * Ejecuta el caso de uso de obtener todas las cuentas de pago
   * 
   * @param {Object} options - Opciones para obtener cuentas de pago
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
      // GET /v1/cuentas-pago?pagina=1&limite=10&busqueda=...&ordenar=nombre
      const result = await this.paymentAccountRepository.obtenerTodos({ params });
      
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
        error: error.message || 'Error al obtener cuentas de pago',
      };
    }
  }
}
