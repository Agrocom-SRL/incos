/**
 * Implementación del Repositorio de administración del catálogo Tipos de evaluación
 * Implementa ITipoEvaluacionAdminRepository usando API client
 *
 * Single Responsibility: Solo maneja llamadas HTTP para el CRUD de administración
 * (CFG → Recursos académicos, permiso `configuracion.tipo-evaluacion`).
 *
 * NOTA: distinto de `TipoEvaluacionRepository` (combo de solo lectura del
 * cuaderno de calificaciones, `GET /calificaciones/tipos-evaluacion`, no se toca).
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { ITipoEvaluacionAdminRepository } from '@domain/repositories';
import { TIPOS_EVALUACION_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class TipoEvaluacionAdminRepository extends ITipoEvaluacionAdminRepository {
  /**
   * Obtiene la lista de tipos de evaluación con filtros y paginación
   * GET /v1/tipos-evaluacion
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(TIPOS_EVALUACION_ENDPOINTS.BASE, { params });
      const result = handleSuccessResponse(response);
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener tipos de evaluación');
    }
  }

  /**
   * Obtiene un tipo de evaluación por ID
   * GET /v1/tipos-evaluacion/:id
   */
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(TIPOS_EVALUACION_ENDPOINTS.BY_ID(id));
      const result = handleSuccessResponse(response);
      if (result.success && result.data && !result.data.tipoEvaluacion) {
        result.data = { tipoEvaluacion: result.data };
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el tipo de evaluación');
    }
  }

  /**
   * Crea un tipo de evaluación
   * POST /v1/tipos-evaluacion
   */
  async crear(data) {
    try {
      const response = await apiClient.post(TIPOS_EVALUACION_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear el tipo de evaluación');
    }
  }

  /**
   * Actualiza un tipo de evaluación
   * PUT /v1/tipos-evaluacion/:id
   */
  async actualizar(id, data) {
    try {
      const response = await apiClient.put(TIPOS_EVALUACION_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el tipo de evaluación');
    }
  }

  /**
   * Cambia el estado activo/inactivo de un tipo de evaluación
   * PATCH /v1/tipos-evaluacion/:id/estado
   *
   * @param {string|number} id
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async cambiarEstado(id, activo) {
    try {
      const response = await apiClient.patch(TIPOS_EVALUACION_ENDPOINTS.ESTADO(id), { activo });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al cambiar el estado del tipo de evaluación');
    }
  }

  /**
   * Elimina (soft delete) un tipo de evaluación
   * DELETE /v1/tipos-evaluacion/:id
   */
  async eliminar(id) {
    try {
      const response = await apiClient.delete(TIPOS_EVALUACION_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar el tipo de evaluación');
    }
  }
}

export default new TipoEvaluacionAdminRepository();
