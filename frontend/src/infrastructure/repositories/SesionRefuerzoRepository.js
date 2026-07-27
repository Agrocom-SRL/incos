/**
 * Implementación del Repositorio de Sesiones de Refuerzo (módulo TUT)
 * Implementa ISesionRefuerzoRepository usando API client
 *
 * Single Responsibility: Solo maneja llamadas HTTP de sesiones de
 * refuerzo y sus participantes.
 *
 * Contrato A4-A9: docs/plan/tutorias-plan-desarrollo.md.
 */

import apiClient from '@api-client';
import { ISesionRefuerzoRepository } from '@domain/repositories';
import { ACOMPANAMIENTO_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class SesionRefuerzoRepository extends ISesionRefuerzoRepository {
  /**
   * Listado de sesiones (A4, vista 161, `sesionesRefuerzo`).
   * GET /v1/acompanamiento/sesiones?estado=&gestionId=
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(ACOMPANAMIENTO_ENDPOINTS.SESIONES, { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener las sesiones de refuerzo');
    }
  }

  /** Ficha de una sesión + participantes (A5, `sesionRefuerzo`). GET /v1/acompanamiento/sesiones/:id */
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(ACOMPANAMIENTO_ENDPOINTS.SESION(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener la sesión de refuerzo');
    }
  }

  /** Programa una sesión con sus participantes (A6). POST /v1/acompanamiento/sesiones */
  async crear(data) {
    try {
      const response = await apiClient.post(ACOMPANAMIENTO_ENDPOINTS.SESIONES, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al programar la sesión de refuerzo');
    }
  }

  /** Actualiza los datos de la sesión (A7). PUT /v1/acompanamiento/sesiones/:id */
  async actualizar(id, data) {
    try {
      const response = await apiClient.put(ACOMPANAMIENTO_ENDPOINTS.SESION(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar la sesión de refuerzo');
    }
  }

  /** Elimina (soft delete) una sesión (A8). DELETE /v1/acompanamiento/sesiones/:id */
  async eliminar(id) {
    try {
      const response = await apiClient.delete(ACOMPANAMIENTO_ENDPOINTS.SESION(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar la sesión de refuerzo');
    }
  }

  /**
   * Registro batch de asistencia/progreso (A9, `estudiantes`).
   * PUT /v1/acompanamiento/sesiones/:id/participantes
   */
  async registrarEstudiantes(id, estudiantes) {
    try {
      const response = await apiClient.put(ACOMPANAMIENTO_ENDPOINTS.SESION_ESTUDIANTES(id), {
        estudiantes,
      });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al registrar la asistencia de la sesión');
    }
  }
}

export default new SesionRefuerzoRepository();
