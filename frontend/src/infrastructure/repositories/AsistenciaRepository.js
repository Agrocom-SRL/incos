/**
 * Repositorio HTTP — módulo Asistencia (Académico · ítem ACA-ASI).
 * Mis cursos + coordinación (elegir docente). Gemelo de CalificacionRepository.
 */

import apiClient from '@api-client';
import { ASISTENCIA_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse } from '@api/responseHandler';

class AsistenciaRepository {
  /**
   * GET /v1/asistencia/coordinacion/docentes
   * @param {{ q?: string, limit?: number, preliminar?: boolean }} options
   */
  async listarCoordinacionDocentes(options = {}) {
    try {
      const { q = '', limit, preliminar } = options;
      const params = {};
      if (preliminar) {
        params.preliminar = '1';
      } else if (String(q).trim().length >= 2) {
        params.q = String(q).trim();
      } else {
        params.preliminar = '1';
      }
      if (limit != null) params.limit = limit;

      const response = await apiClient.get(ASISTENCIA_ENDPOINTS.COORDINACION_DOCENTES, { params });
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      const payload = responseData.data ?? {};
      return {
        success: true,
        data: {
          gestionVigente: payload.gestionVigente ?? null,
          bimestreVigente: payload.bimestreVigente ?? null,
          docentes: Array.isArray(payload.docentes) ? payload.docentes : [],
        },
      };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar docentes de coordinación');
    }
  }

  /**
   * GET /v1/asistencia/mis-cursos
   */
  async listarMisCursos() {
    try {
      const response = await apiClient.get(ASISTENCIA_ENDPOINTS.MIS_CURSOS);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar tus cursos');
    }
  }

  /**
   * GET /v1/asistencia/coordinacion/docentes/:docenteId/cursos
   */
  async listarCursosDocenteCoordinacion(docenteId) {
    try {
      const response = await apiClient.get(
        ASISTENCIA_ENDPOINTS.COORDINACION_DOCENTE_CURSOS(docenteId),
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar los cursos del docente');
    }
  }
}

export default new AsistenciaRepository();
