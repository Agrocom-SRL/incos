/**
 * Implementación del Repositorio de Cuentas de Pago
 * Implementa IPaymentAccountRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para cuentas de pago
 * Liskov Substitution Principle: Puede reemplazar IPaymentAccountRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IPaymentAccountRepository } from '@domain/repositories';
import { CUENTAS_PAGO_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class PaymentAccountRepository extends IPaymentAccountRepository {
  /**
   * Obtiene la lista de cuentas de pago con filtros y paginación
   * GET /v1/cuentas-pago?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(CUENTAS_PAGO_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener cuentas de pago');
    }
  }

}

export default new PaymentAccountRepository();
