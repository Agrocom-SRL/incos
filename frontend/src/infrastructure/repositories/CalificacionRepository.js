/**
 * Repositorio HTTP — módulo Calificaciones (coordinación).
 */

import apiClient from '@api-client';
import { CALIFICACIONES_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse } from '@api/responseHandler';

class CalificacionRepository {
  /**
   * GET /v1/calificaciones/coordinacion/docentes
   * @param {Object} options
   * @param {string} [options.q]
   * @param {number} [options.limit]
   * @param {boolean} [options.preliminar]
   * @returns {Promise<{success: boolean, data?: { gestionVigente, bimestreVigente, docentes }, error?: string}>}
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

      const response = await apiClient.get(CALIFICACIONES_ENDPOINTS.COORDINACION_DOCENTES, { params });
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
   * GET /v1/calificaciones/politica/catalogo
   */
  async obtenerPoliticaCatalogo() {
    try {
      const response = await apiClient.get(CALIFICACIONES_ENDPOINTS.POLITICA_CATALOGO);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data?.catalogo ?? responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar catálogo de política');
    }
  }

  /**
   * GET /v1/calificaciones/politica
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async obtenerPoliticaInstitucional() {
    try {
      const response = await apiClient.get(CALIFICACIONES_ENDPOINTS.POLITICA);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar la configuración de notas');
    }
  }

  /**
   * PUT /v1/calificaciones/politica
   * @param {Object} cambios
   */
  async guardarPoliticaInstitucional(cambios) {
    try {
      const response = await apiClient.put(CALIFICACIONES_ENDPOINTS.POLITICA, cambios);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al guardar la configuración de notas');
    }
  }
}

export default new CalificacionRepository();
