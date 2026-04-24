/**
 * Repositorio HTTP — docentes
 */

import apiClient from '@api-client';
import { IDocenteRepository } from '@repositories/IDocenteRepository';
import { DOCENTES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class DocenteRepository extends IDocenteRepository {
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
}

export default new DocenteRepository();
