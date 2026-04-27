/**
 * Repositorio HTTP — docentes
 */

import apiClient from '@api-client';
import { IDocenteRepository } from '@repositories/IDocenteRepository';
import { DOCENTES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class DocenteRepository extends IDocenteRepository {
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(DOCENTES_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el docente');
    }
  }

  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(DOCENTES_ENDPOINTS.BASE, { params });
      const result = handleSuccessResponse(response);
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener docentes');
    }
  }

  async crear(data) {
    try {
      const response = await apiClient.post(DOCENTES_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear docente');
    }
  }

  async actualizar(id, data) {
    try {
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return {
          success: false,
          error: 'ID del docente es requerido',
        };
      }
      const response = await apiClient.put(DOCENTES_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar docente');
    }
  }
}

export default new DocenteRepository();
