/**
 * Implementación del Repositorio de Fichas de Seguimiento en Clase (módulo
 * DOC · Supervisión docente). Implementa IFichaSeguimientoRepository usando
 * el API client.
 *
 * Single Responsibility: solo llamadas HTTP de `/supervision-docente` y la
 * descarga binaria del PDF (S6). Contrato: docs/plan/supervision-docente-plan-desarrollo.md.
 */

import apiClient from '@api-client';
import { IFichaSeguimientoRepository } from '@domain/repositories';
import { SUPERVISION_DOCENTE_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class FichaSeguimientoRepository extends IFichaSeguimientoRepository {
  /** Listado de fichas (S1, vista 174, `fichasSeguimiento`). GET /v1/supervision-docente */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(SUPERVISION_DOCENTE_ENDPOINTS.BASE, { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener las fichas de seguimiento');
    }
  }

  /** Ficha completa (S2, `fichaSeguimiento`). GET /v1/supervision-docente/:id */
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(SUPERVISION_DOCENTE_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener la ficha de seguimiento');
    }
  }

  /** Registra la ficha (S3, `fichaSeguimiento`). POST /v1/supervision-docente */
  async crear(data) {
    try {
      const response = await apiClient.post(SUPERVISION_DOCENTE_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al registrar la ficha de seguimiento');
    }
  }

  /** Actualiza la ficha (S4, `fichaSeguimiento`). PUT /v1/supervision-docente/:id */
  async actualizar(id, data) {
    try {
      const response = await apiClient.put(SUPERVISION_DOCENTE_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar la ficha de seguimiento');
    }
  }

  /**
   * Fichas de los cursos del docente AUTENTICADO (S5, `fichasSeguimiento`,
   * anti-IDOR: el docente se resuelve en el servidor).
   * GET /v1/supervision-docente/mis-fichas
   */
  async obtenerMisFichas() {
    try {
      const response = await apiClient.get(SUPERVISION_DOCENTE_ENDPOINTS.MIS_FICHAS);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener sus fichas de seguimiento');
    }
  }

  /**
   * Descarga binaria del PDF de la ficha (S6). Resuelve el nombre de archivo
   * desde `Content-Disposition` (el backend ya arma
   * `ficha-seguimiento-{apellidos}-{fecha}.pdf`).
   * GET /v1/supervision-docente/:id/pdf
   */
  async exportarPdf(id) {
    try {
      const response = await apiClient.get(SUPERVISION_DOCENTE_ENDPOINTS.PDF(id), {
        responseType: 'blob',
      });

      const disposition = response.headers?.['content-disposition'] || '';
      const quotedMatch = disposition.match(/filename="([^"]+)"/i);
      const plainMatch = disposition.match(/filename=([^;\s]+)/i);
      const fileName = quotedMatch?.[1] || plainMatch?.[1]?.replace(/['"]/g, '') || 'ficha-seguimiento.pdf';

      return { success: true, blob: response.data, fileName };
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          const errObj = json?.error;
          const msg =
            typeof errObj === 'string'
              ? errObj
              : errObj?.message || json?.message || 'Error al exportar la ficha a PDF';
          return { success: false, error: msg };
        } catch {
          return { success: false, error: 'Error al exportar la ficha a PDF' };
        }
      }
      return handleErrorResponse(error, 'Error al exportar la ficha a PDF');
    }
  }
}

export default new FichaSeguimientoRepository();
