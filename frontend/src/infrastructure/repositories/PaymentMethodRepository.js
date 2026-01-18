/**
 * Implementación del Repositorio de Métodos de Pago
 * Implementa IPaymentMethodRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para métodos de pago
 * Liskov Substitution Principle: Puede reemplazar IPaymentMethodRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IPaymentMethodRepository } from '@domain/repositories';
import { METODOS_PAGO_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class PaymentMethodRepository extends IPaymentMethodRepository {
  /**
   * Obtiene la lista de métodos de pago con filtros y paginación
   * GET /v1/metodos-pago?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(METODOS_PAGO_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener métodos de pago');
    }
  }

}

export default new PaymentMethodRepository();
