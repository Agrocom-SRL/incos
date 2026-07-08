/**
 * Implementación del Repositorio de Idiomas
 * Implementa IIdiomaRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para idiomas
 * Liskov Substitution Principle: Puede reemplazar IIdiomaRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IIdiomaRepository } from '@domain/repositories';
import { IDIOMAS_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class IdiomaRepository extends IIdiomaRepository {
  /**
   * Obtiene la lista de idiomas con filtros y paginación
   * GET /v1/idiomas?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(IDIOMAS_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener idiomas');
    }
  }

  /**
   * Obtiene un idioma por ID
   * GET /v1/idiomas/:id
   */
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(IDIOMAS_ENDPOINTS.BY_ID(id));
      const result = handleSuccessResponse(response);
      // El backend puede devolver el registro plano (sin envolver en { idioma })
      if (result.success && result.data && !result.data.idioma) {
        result.data = { idioma: result.data };
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el idioma');
    }
  }

  /**
   * Crea un idioma
   * POST /v1/idiomas
   */
  async crear(data) {
    try {
      const response = await apiClient.post(IDIOMAS_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear el idioma');
    }
  }

  /**
   * Actualiza un idioma
   * PUT /v1/idiomas/:id
   */
  async actualizar(id, data) {
    try {
      const response = await apiClient.put(IDIOMAS_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el idioma');
    }
  }

  /**
   * Cambia el estado activo/inactivo de un idioma
   * PATCH /v1/idiomas/:id/estado
   *
   * @param {string|number} id
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async cambiarEstado(id, activo) {
    try {
      const response = await apiClient.patch(IDIOMAS_ENDPOINTS.ESTADO(id), { activo });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al cambiar el estado del idioma');
    }
  }

  /**
   * Elimina (soft delete) un idioma
   * DELETE /v1/idiomas/:id
   */
  async eliminar(id) {
    try {
      const response = await apiClient.delete(IDIOMAS_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar el idioma');
    }
  }
}

export default new IdiomaRepository();

