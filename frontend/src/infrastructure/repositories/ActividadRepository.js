/**
 * Implementación del Repositorio de Actividades (catálogo maestro)
 * Implementa IActividadRepository usando API client
 *
 * Single Responsibility: Solo maneja llamadas HTTP para actividades
 * Liskov Substitution Principle: Puede reemplazar IActividadRepository
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IActividadRepository } from '@domain/repositories';
import { ACTIVIDADES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class ActividadRepository extends IActividadRepository {
  /**
   * Obtiene la lista de actividades con filtros y paginación
   * GET /v1/actividades?pagina=1&limite=10&busqueda=...&tipo=...&esDestacada=...
   *
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      const response = await apiClient.get(ACTIVIDADES_ENDPOINTS.BASE, { params });

      const result = handleSuccessResponse(response);

      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener actividades');
    }
  }

  /**
   * Obtiene una actividad por ID
   * GET /v1/actividades/:id
   */
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(ACTIVIDADES_ENDPOINTS.BY_ID(id));
      const result = handleSuccessResponse(response);
      // El backend puede devolver el registro plano (sin envolver en { actividad })
      if (result.success && result.data && !result.data.actividad) {
        result.data = { actividad: result.data };
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener la actividad');
    }
  }

  /**
   * Crea una actividad
   * POST /v1/actividades
   */
  async crear(data) {
    try {
      const response = await apiClient.post(ACTIVIDADES_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear la actividad');
    }
  }

  /**
   * Actualiza una actividad
   * PUT /v1/actividades/:id
   */
  async actualizar(id, data) {
    try {
      const response = await apiClient.put(ACTIVIDADES_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar la actividad');
    }
  }

  /**
   * Cambia el estado activo/inactivo de una actividad
   * PATCH /v1/actividades/:id/estado
   *
   * @param {string|number} id
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async cambiarEstado(id, activo) {
    try {
      const response = await apiClient.patch(ACTIVIDADES_ENDPOINTS.ESTADO(id), { activo });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al cambiar el estado de la actividad');
    }
  }

  /**
   * Elimina (soft delete) una actividad
   * DELETE /v1/actividades/:id
   */
  async eliminar(id) {
    try {
      const response = await apiClient.delete(ACTIVIDADES_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar la actividad');
    }
  }
}

export default new ActividadRepository();
