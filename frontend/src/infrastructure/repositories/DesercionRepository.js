/**
 * Repositorio HTTP — Deserción estudiantil (pestaña Deserción de /academico/avance).
 *
 * Nace con la disolución del módulo REP (2026-07-29): consume los endpoints
 * ACA `GET /desercion(/export)` (permiso `academico.desercion`). Métrica ANUAL
 * por estados consolidados ABANDONO/RETIRADO de matriculas_materia.
 */

import apiClient from '@api-client';
import { DESERCION_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse } from '@api/responseHandler';
import {
  extractFileNameFromDisposition,
  readBlobErrorMessage,
} from '@api/binaryDownload';

class DesercionRepository {
  /**
   * GET /v1/desercion[?gestionId=<entero>][&carreraId=<entero>]
   *
   * dataKeys `carreras` (agregado carrera × gestión), `desertores` (detalle) y
   * `resumen` (totales globales) == dataFieldNames del use case backend.
   *
   * @param {Object} [options]
   * @param {number|null} [options.gestionId] - null = todas las gestiones.
   * @param {number|null} [options.carreraId] - null = todas las carreras.
   * @returns {Promise<{success: boolean, data?: { carreras: Array, desertores: Array, resumen: Object }, error?: string}>}
   */
  async obtenerDesercion({ gestionId = null, carreraId = null } = {}) {
    try {
      const params = {};
      if (gestionId != null) params.gestionId = gestionId;
      if (carreraId != null) params.carreraId = carreraId;

      const response = await apiClient.get(DESERCION_ENDPOINTS.BASE, { params });
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
          carreras: Array.isArray(payload.carreras) ? payload.carreras : [],
          desertores: Array.isArray(payload.desertores) ? payload.desertores : [],
          resumen: payload.resumen ?? null,
        },
      };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar la deserción estudiantil');
    }
  }

  /**
   * GET /v1/desercion/export[?gestionId][&carreraId] — descarga .xlsx (planilla verde).
   *
   * @param {Object} [options]
   * @param {number|null} [options.gestionId]
   * @param {number|null} [options.carreraId]
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarDesercionExcel({ gestionId = null, carreraId = null } = {}) {
    try {
      const params = {};
      if (gestionId != null) params.gestionId = gestionId;
      if (carreraId != null) params.carreraId = carreraId;

      const response = await apiClient.get(DESERCION_ENDPOINTS.EXPORT, {
        params,
        responseType: 'blob',
      });

      return {
        success: true,
        blob: response.data,
        fileName: extractFileNameFromDisposition(
          response.headers['content-disposition'],
          'desercion.xlsx',
        ),
      };
    } catch (error) {
      const blobMessage = await readBlobErrorMessage(error, 'Error al exportar deserción');
      if (blobMessage) return { success: false, error: blobMessage };
      return handleErrorResponse(error, 'Error al exportar deserción');
    }
  }
}

export default new DesercionRepository();
