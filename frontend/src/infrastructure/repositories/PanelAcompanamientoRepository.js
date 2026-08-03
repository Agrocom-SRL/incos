/**
 * Implementación del Repositorio del Panel de Acompañamiento (módulo TUT)
 * Implementa IPanelAcompanamientoRepository usando API client
 *
 * Single Responsibility: Solo maneja llamadas HTTP de lectura/exportación del
 * panel agregado (vistas 157/158/162 + top de la 156).
 *
 * Contrato A10-A11: docs/plan/tutorias-plan-desarrollo.md.
 */

import apiClient from '@api-client';
import { IPanelAcompanamientoRepository } from '@domain/repositories';
import { ACOMPANAMIENTO_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

/** Nombre de archivo desde Content-Disposition (patrón exportarInscritos de CAP). */
const parseFileName = (response, fallback) => {
  const disposition = response.headers?.['content-disposition'] || '';
  const starMatch = disposition.match(/filename\*=UTF-8''([^;\s]+)/i);
  const quotedMatch = disposition.match(/filename="([^"]+)"/i);
  const plainMatch = disposition.match(/filename=([^;\s]+)/i);
  if (starMatch) {
    try {
      return decodeURIComponent(starMatch[1].replace(/['"]/g, ''));
    } catch {
      return starMatch[1];
    }
  }
  if (quotedMatch) return quotedMatch[1];
  if (plainMatch) return plainMatch[1].replace(/['"]/g, '');
  return fallback;
};

export class PanelAcompanamientoRepository extends IPanelAcompanamientoRepository {
  /**
   * Datos agregados del panel (A10, `panelAcompanamiento`).
   * GET /v1/acompanamiento/panel?gestionId=
   */
  async obtenerPanel(params = {}) {
    try {
      const response = await apiClient.get(ACOMPANAMIENTO_ENDPOINTS.PANEL(params.gestionId));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el panel de acompañamiento');
    }
  }

  /**
   * Exporta el panel a PDF (A11, panel·EXPORTAR, blob autenticado).
   * GET /v1/acompanamiento/panel/exportar?gestionId=
   */
  async exportarPanel(params = {}) {
    try {
      const response = await apiClient.get(
        ACOMPANAMIENTO_ENDPOINTS.PANEL_EXPORTAR(params.gestionId),
        { responseType: 'blob' },
      );
      return {
        success: true,
        blob: response.data,
        fileName: parseFileName(response, 'panel_acompanamiento.pdf'),
      };
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          const errObj = json?.error;
          const msg = typeof errObj === 'string' ? errObj : errObj?.message || json?.message;
          return { success: false, error: msg || 'Error al exportar el panel de acompañamiento' };
        } catch {
          return { success: false, error: 'Error al exportar el panel de acompañamiento' };
        }
      }
      return handleErrorResponse(error, 'Error al exportar el panel de acompañamiento');
    }
  }
}

export default new PanelAcompanamientoRepository();
