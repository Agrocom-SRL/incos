/**
 * Catálogo tipos_evaluacion — GET /v1/calificaciones/tipos-evaluacion
 */

import apiClient from '@api-client';
import { ITipoEvaluacionRepository } from '@domain/repositories/ITipoEvaluacionRepository.js';
import { CALIFICACIONES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class TipoEvaluacionRepository extends ITipoEvaluacionRepository {
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(CALIFICACIONES_ENDPOINTS.TIPOS_EVALUACION, { params });
      const result = handleSuccessResponse(response);

      if (result.success && result.data) {
        const rows = Array.isArray(result.data)
          ? result.data
          : result.data.tiposEvaluacion ?? [];
        result.data = rows;
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar tipos de evaluación');
    }
  }
}

export default new TipoEvaluacionRepository();
