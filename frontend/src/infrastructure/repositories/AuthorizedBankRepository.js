/**
 * Implementación del Repositorio de Bancos Autorizados
 * Implementa IAuthorizedBankRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para bancos autorizados
 * Liskov Substitution Principle: Puede reemplazar IAuthorizedBankRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IAuthorizedBankRepository } from '@domain/repositories';
import { BANCOS_AUTORIZADOS_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class AuthorizedBankRepository extends IAuthorizedBankRepository {
  /**
   * Obtiene la lista de bancos autorizados con filtros y paginación
   * GET /v1/bancos-autorizados?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(BANCOS_AUTORIZADOS_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener bancos autorizados');
    }
  }

  /**
   * Crea un banco autorizado.
   * POST /v1/bancos-autorizados
   *
   * @param {Object} payload - { metodo_pago_id?, codigo (req), nombre (req), activo? }
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>} data.bancoAutorizado
   */
  async crear(payload = {}) {
    try {
      const response = await apiClient.post(BANCOS_AUTORIZADOS_ENDPOINTS.BASE, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear el banco autorizado');
    }
  }

  /**
   * Actualiza un banco autorizado.
   * PUT /v1/bancos-autorizados/:id
   *
   * @param {string|number} id - ID del banco
   * @param {Object} payload - { metodo_pago_id?, codigo?, nombre?, activo? }
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>} data.bancoAutorizado
   */
  async actualizar(id, payload = {}) {
    try {
      if (!id && id !== 0) {
        return { success: false, error: 'ID del banco es requerido' };
      }
      const response = await apiClient.put(BANCOS_AUTORIZADOS_ENDPOINTS.BY_ID(id), payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el banco autorizado');
    }
  }

  /**
   * Elimina (soft delete) un banco autorizado.
   * DELETE /v1/bancos-autorizados/:id
   *
   * @param {string|number} id - ID del banco
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async eliminar(id) {
    try {
      if (!id && id !== 0) {
        return { success: false, error: 'ID del banco es requerido' };
      }
      const response = await apiClient.delete(BANCOS_AUTORIZADOS_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar el banco autorizado');
    }
  }

}

export default new AuthorizedBankRepository();
