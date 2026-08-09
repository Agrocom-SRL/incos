/**
 * Repositorio HTTP — Registro de ingresos (Finanzas · listado unificado
 * transaccional, vista 184 vista_ingresos_listado).
 *
 * Solo lectura: une transacciones de aportes académicos (pago_cuotas) y de
 * pagos de capacitación (capacitacion_pagos) bajo un mismo contrato. NO tiene
 * interfaz de dominio (Arquetipo B, mismo criterio que `DesercionRepository`):
 * es un repositorio de vista, no un CRUD.
 */

import apiClient from '@api-client';
import { INGRESOS_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

class IngresoRepository {
  /**
   * GET /v1/ingresos?page=&limit=&search=&sort=campo:ASC|DESC&origen=
   *
   * `dataKey` ('data') coincide EXACTO con el `dataFieldName` del backend: el
   * array de filas viaja bajo `data` (no bajo `ingresos`).
   *
   * @param {Object} [options]
   * @param {Object} [options.params] - page, limit, search, sort, origen ('APORTE'|'CAPACITACION')
   * @returns {Promise<{success: boolean, data?: Array, pagination?: {page,limit,total,totalPages}, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(INGRESOS_ENDPOINTS.BASE, { params });
      const result = handleSuccessResponse(response);
      if (!result.success) return result;

      return {
        success: true,
        data: Array.isArray(result.data) ? result.data : [],
        pagination: result.pagination ?? null,
      };
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el registro de ingresos');
    }
  }
}

export default new IngresoRepository();
