/**
 * Implementación del Repositorio de Alertas de Riesgo Pedagógico (módulo TUT)
 * Implementa IAlertaRiesgoRepository usando API client
 *
 * Single Responsibility: Solo maneja llamadas HTTP de lectura de riesgo
 * (vista 156, arquetipo B — no hay escritura: el riesgo es calculado).
 *
 * Contrato A1-A3: docs/plan/tutorias-plan-desarrollo.md.
 */

import apiClient from '@api-client';
import { IAlertaRiesgoRepository } from '@domain/repositories';
import { ACOMPANAMIENTO_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class AlertaRiesgoRepository extends IAlertaRiesgoRepository {
  /**
   * Alertas de riesgo de la gestión (A1, `alertasRiesgo`).
   * GET /v1/acompanamiento/alertas?gestionId=&carreraId=&materiaId=
   */
  async obtenerAlertas(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(ACOMPANAMIENTO_ENDPOINTS.ALERTAS, { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener las alertas de riesgo');
    }
  }

  /**
   * Alumnos en riesgo de los cursos del docente autenticado (A2,
   * `misAlumnosEnRiesgo`). GET /v1/acompanamiento/alertas/mis-alumnos
   */
  async obtenerMisAlumnos() {
    try {
      const response = await apiClient.get(ACOMPANAMIENTO_ENDPOINTS.ALERTAS_MIS_ALUMNOS);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener sus alumnos en riesgo');
    }
  }

  /**
   * Detalle de riesgo de un estudiante (A3, `alertaEstudiante`).
   * GET /v1/acompanamiento/alertas/estudiante/:estudianteId
   */
  async obtenerAlertaEstudiante(estudianteId) {
    try {
      const response = await apiClient.get(
        ACOMPANAMIENTO_ENDPOINTS.ALERTA_ESTUDIANTE(estudianteId),
      );
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el detalle de riesgo del estudiante');
    }
  }
}

export default new AlertaRiesgoRepository();
