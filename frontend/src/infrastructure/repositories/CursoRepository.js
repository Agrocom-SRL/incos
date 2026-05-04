import apiClient from '@api-client';
import { CURSOS_ENDPOINTS } from '@api/endpoints';
import { ICursoRepository } from '@domain/repositories';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class CursoRepository extends ICursoRepository {
  async actualizarOferta({ courseId, payload }) {
    try {
      const id = Number(courseId);
      if (!Number.isFinite(id) || id < 1) {
        return { success: false, error: 'ID de curso inválido' };
      }
      const response = await apiClient.patch(CURSOS_ENDPOINTS.BY_ID(id), payload);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el curso');
    }
  }

  async eliminarOferta({ courseId, parallelId }) {
    try {
      const id = Number(courseId);
      if (!Number.isFinite(id) || id < 1) {
        return { success: false, error: 'ID de curso inválido' };
      }
      const params = {};
      if (parallelId != null && Number.isFinite(Number(parallelId)) && Number(parallelId) > 0) {
        params.paraleloId = Number(parallelId);
      }
      const response = await apiClient.delete(CURSOS_ENDPOINTS.BY_ID(id), { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar el curso');
    }
  }
}

export default new CursoRepository();
