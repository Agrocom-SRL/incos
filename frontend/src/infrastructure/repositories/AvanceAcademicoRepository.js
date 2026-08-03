/**
 * Repositorio HTTP — Avance académico (Académico · /academico/avance).
 *
 * Nace con la disolución del módulo REP (2026-07-29): consume los endpoints
 * ACA `GET /avance-academico(/export)` (permiso `academico.avance`). El
 * backend entrega los campos en camelCase y el nombre completo en orden
 * canónico (APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES); no se transforma.
 */

import apiClient from '@api-client';
import { AVANCE_ACADEMICO_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse } from '@api/responseHandler';
import {
  extractFileNameFromDisposition,
  readBlobErrorMessage,
} from '@api/binaryDownload';

class AvanceAcademicoRepository {
  /**
   * GET /v1/avance-academico[?carreraId=<entero>]
   *
   * dataKey `avance` == dataFieldName del use case backend. Si el usuario es
   * ESTUDIANTE el servidor acota a su propia fila y devuelve `alcance: 'PROPIO'`.
   *
   * @param {Object} [options]
   * @param {number|null} [options.carreraId]
   * @returns {Promise<{success: boolean, data?: { avance: Array, resumen: Object, alcance: 'GLOBAL'|'PROPIO' }, error?: string}>}
   */
  async obtenerAvance({ carreraId = null } = {}) {
    try {
      const params = {};
      if (carreraId != null) params.carreraId = carreraId;

      const response = await apiClient.get(AVANCE_ACADEMICO_ENDPOINTS.BASE, { params });
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
          avance: Array.isArray(payload.avance) ? payload.avance : [],
          resumen: payload.resumen ?? null,
          alcance: payload.alcance ?? 'GLOBAL',
        },
      };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar el avance académico');
    }
  }

  /**
   * GET /v1/avance-academico/export[?carreraId] — descarga .xlsx (planilla verde).
   *
   * @param {Object} [options]
   * @param {number|null} [options.carreraId]
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarAvanceExcel({ carreraId = null } = {}) {
    try {
      const params = {};
      if (carreraId != null) params.carreraId = carreraId;

      const response = await apiClient.get(AVANCE_ACADEMICO_ENDPOINTS.EXPORT, {
        params,
        responseType: 'blob',
      });

      return {
        success: true,
        blob: response.data,
        fileName: extractFileNameFromDisposition(
          response.headers['content-disposition'],
          'avance_academico.xlsx',
        ),
      };
    } catch (error) {
      const blobMessage = await readBlobErrorMessage(error, 'Error al exportar avance académico');
      if (blobMessage) return { success: false, error: blobMessage };
      return handleErrorResponse(error, 'Error al exportar avance académico');
    }
  }
}

export default new AvanceAcademicoRepository();
