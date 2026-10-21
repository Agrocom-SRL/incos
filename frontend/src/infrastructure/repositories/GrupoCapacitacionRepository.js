/**
 * Implementación del Repositorio de Grupos de capacitación (módulo CAP)
 * Implementa IGrupoCapacitacionRepository usando API client
 *
 * Single Responsibility: Solo maneja la llamada HTTP del listado de grupos
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 */

import apiClient from '@api-client';
import { IGrupoCapacitacionRepository } from '@domain/repositories';
import { GRUPOS_CAPACITACION_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class GrupoCapacitacionRepository extends IGrupoCapacitacionRepository {
  /**
   * Lista los grupos de todos los cursos (solo lectura).
   * GET /v1/cursos-capacitacion/grupos?search=&cursoId=&estado=
   * El backend envuelve la lista en `{ grupos: [...] }`: se normaliza a array.
   *
   * @param {Object} options - { params: { search, cursoId, estado } }
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(GRUPOS_CAPACITACION_ENDPOINTS.BASE, { params });
      const result = handleSuccessResponse(response);
      if (result.success) {
        const lista = result.data?.grupos ?? result.data;
        result.data = Array.isArray(lista) ? lista : [];
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener los grupos de capacitación');
    }
  }
}

export default new GrupoCapacitacionRepository();
