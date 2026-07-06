/**
 * Implementación del Repositorio de Tipos de Discapacidad
 * Implementa IDiscapacidadRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para tipos de discapacidad
 * Liskov Substitution Principle: Puede reemplazar IDiscapacidadRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IDiscapacidadRepository } from '@domain/repositories';
import { DISCAPACIDAD_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class DiscapacidadRepository extends IDiscapacidadRepository {
  /**
   * Obtiene la lista de tipos de discapacidad con filtros y paginación
   * GET /v1/discapacidad?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  /**
   * Obtiene la lista de tipos de discapacidad con filtros y paginación
   * GET /v1/discapacidad?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(DISCAPACIDAD_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener tipos de discapacidad');
    }
  }

  /**
   * Obtiene un tipo de discapacidad por ID
   * GET /v1/discapacidad/:id
   *
   * @param {string|number} id
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(DISCAPACIDAD_ENDPOINTS.BY_ID(id));
      const result = handleSuccessResponse(response);
      // El backend puede devolver el registro plano (sin envolver en { discapacidad })
      if (result.success && result.data && !result.data.discapacidad) {
        result.data = { discapacidad: result.data };
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el tipo de discapacidad');
    }
  }

  /**
   * Crea un tipo de discapacidad
   * POST /v1/discapacidad
   */
  async crear(data) {
    try {
      const response = await apiClient.post(DISCAPACIDAD_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear el tipo de discapacidad');
    }
  }

  /**
   * Actualiza un tipo de discapacidad
   * PUT /v1/discapacidad/:id
   */
  async actualizar(id, data) {
    try {
      const response = await apiClient.put(DISCAPACIDAD_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el tipo de discapacidad');
    }
  }

  /**
   * Elimina (soft delete) un tipo de discapacidad
   * DELETE /v1/discapacidad/:id
   */
  async eliminar(id) {
    try {
      const response = await apiClient.delete(DISCAPACIDAD_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar el tipo de discapacidad');
    }
  }
}

export default new DiscapacidadRepository();

