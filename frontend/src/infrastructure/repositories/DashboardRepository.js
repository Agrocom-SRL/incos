import apiClient from '@api-client';
import { DASHBOARD_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class DashboardRepository {
  /**
   * GET /v1/dashboard/resumen
   * @param {Object} [params]
   * @param {number} [params.limite_actividades]
   * @param {number} [params.limite_docentes]
   */
  async obtenerResumen(params = {}) {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.RESUMEN, { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar el resumen del dashboard');
    }
  }

  /**
   * GET /v1/dashboard/mi-resumen
   * Resumen personal del estudiante autenticado (carrera, docentes, actividades, stats).
   */
  async obtenerMiResumen() {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.MI_RESUMEN);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar su resumen del dashboard');
    }
  }

  /**
   * GET /v1/dashboard/mi-resumen-docente
   * Resumen personal del docente autenticado (gestión vigente, carga, cursos,
   * bloques de horario). La identidad se resuelve en servidor desde el token.
   */
  async obtenerMiResumenDocente() {
    try {
      const response = await apiClient.get(DASHBOARD_ENDPOINTS.MI_RESUMEN_DOCENTE);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar su resumen del dashboard');
    }
  }
}

export default new DashboardRepository();
