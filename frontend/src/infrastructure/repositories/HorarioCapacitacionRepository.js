/**
 * Implementación del Repositorio de Horarios de capacitación (módulo CAP)
 * Implementa IHorarioCapacitacionRepository usando API client
 *
 * Single Responsibility: Solo maneja llamadas HTTP para horarios de capacitación
 * Liskov Substitution Principle: Puede reemplazar IHorarioCapacitacionRepository
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend (camelCase)
 */

import apiClient from '@api-client';
import { IHorarioCapacitacionRepository } from '@domain/repositories';
import { HORARIOS_CAPACITACION_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class HorarioCapacitacionRepository extends IHorarioCapacitacionRepository {
  /**
   * Lista el catálogo de horarios de capacitación (con `cursosEnUso`).
   * GET /v1/cursos-capacitacion/horarios?search=
   * El backend envuelve la lista en `{ horarios: [...] }`: se normaliza a array.
   *
   * @param {Object} options - { params: { search } }
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(HORARIOS_CAPACITACION_ENDPOINTS.BASE, { params });
      const result = handleSuccessResponse(response);
      if (result.success) {
        const lista = result.data?.horarios ?? result.data;
        result.data = Array.isArray(lista) ? lista : [];
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener los horarios de capacitación');
    }
  }

  /**
   * Obtiene un horario. GET /v1/cursos-capacitacion/horarios/:id → `{ horario }`
   */
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(HORARIOS_CAPACITACION_ENDPOINTS.BY_ID(id));
      const result = handleSuccessResponse(response);
      if (result.success && result.data && !result.data.horario) {
        result.data = { horario: result.data };
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el horario de capacitación');
    }
  }

  /**
   * Crea (find-or-create) un horario `{dia, horaInicio, horaFin, nombre?}`.
   * POST /v1/cursos-capacitacion/horarios → `{ horario }`
   */
  async crear(data) {
    try {
      const response = await apiClient.post(HORARIOS_CAPACITACION_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear el horario de capacitación');
    }
  }

  /**
   * Actualiza un horario. PUT /v1/cursos-capacitacion/horarios/:id
   */
  async actualizar(id, data) {
    try {
      const response = await apiClient.put(HORARIOS_CAPACITACION_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el horario de capacitación');
    }
  }

  /**
   * Elimina un horario. DELETE /v1/cursos-capacitacion/horarios/:id
   * 409 si algún curso lo usa: el motivo llega en `error` (lo muestra la UI).
   */
  async eliminar(id) {
    try {
      const response = await apiClient.delete(HORARIOS_CAPACITACION_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar el horario de capacitación');
    }
  }
}

export default new HorarioCapacitacionRepository();
