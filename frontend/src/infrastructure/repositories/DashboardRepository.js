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
}

export default new DashboardRepository();
