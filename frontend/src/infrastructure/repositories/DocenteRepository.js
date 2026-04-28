/**
 * Repositorio HTTP — docentes
 */

import apiClient from '@api-client';
import { IDocenteRepository } from '@repositories/IDocenteRepository';
import { DOCENTES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class DocenteRepository extends IDocenteRepository {
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(DOCENTES_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el docente');
    }
  }

  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(DOCENTES_ENDPOINTS.BASE, { params });
      const result = handleSuccessResponse(response);
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener docentes');
    }
  }

  async crear(data) {
    try {
      const response = await apiClient.post(DOCENTES_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear docente');
    }
  }

  async eliminar(id) {
    try {
      const response = await apiClient.delete(DOCENTES_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar docente');
    }
  }

  /**
   * Lista asignaciones docentes (requiere al menos docenteId, gestionPlanId o cursoId en params).
   * @param {{ docenteId?: number, gestionPlanId?: number, cursoId?: number, page?: number, limit?: number, vigente?: string }} params
   */
  async listarAsignaciones(params = {}) {
    try {
      const response = await apiClient.get(DOCENTES_ENDPOINTS.ASIGNACIONES, { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al listar asignaciones del docente');
    }
  }

  /**
   * Crea una asignación docente a curso en un plan habilitado.
   * @param {{ gestionPlanId: number, cursoId: number, docenteId: number, cargaHoraria?: number, fechaAsignacion?: string, vigente?: boolean }} data
   */
  async crearAsignacion(data) {
    try {
      const response = await apiClient.post(DOCENTES_ENDPOINTS.ASIGNACIONES, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear asignación docente');
    }
  }

  /**
   * Actualiza campos editables de una asignación docente.
   * @param {number} asignacionId
   * @param {{ docenteId?: number|null, cargaHoraria?: number|null, vigente?: boolean, motivo?: string|null, fechaAsignacion?: string|null }} data
   */
  async actualizarAsignacion(asignacionId, data) {
    try {
      const response = await apiClient.patch(DOCENTES_ENDPOINTS.ASIGNACION_BY_ID(asignacionId), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar asignación docente');
    }
  }

  async eliminarAsignacion(asignacionId) {
    try {
      const response = await apiClient.delete(DOCENTES_ENDPOINTS.ASIGNACION_BY_ID(asignacionId));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar asignación docente');
    }
  }

  /**
   * Planes habilitados para el flujo de asignación (catálogo).
   * @param {{ gestionId?: number, page?: number, limit?: number }} params
   */
  async listarPlanesHabilitadosAsignacion(params = {}) {
    try {
      const response = await apiClient.get(DOCENTES_ENDPOINTS.PLANES_HABILITADOS, { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al listar planes habilitados');
    }
  }

  /**
   * Cursos disponibles según plan habilitado.
   * @param {{ gestionPlanId: number, page?: number, limit?: number }} params
   */
  async listarCursosDisponiblesAsignacion(params) {
    try {
      const response = await apiClient.get(DOCENTES_ENDPOINTS.CURSOS_DISPONIBLES, { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al listar cursos disponibles');
    }
  }

  /**
   * Periodos (años del plan) del plan de estudios del plan habilitado.
   * @param {{ gestionPlanId: number, page?: number, limit?: number }} params
   */
  async listarPeriodosAsignacion(params) {
    try {
      const response = await apiClient.get(DOCENTES_ENDPOINTS.PERIODOS_DISPONIBLES, { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al listar periodos');
    }
  }

  /**
   * Paralelos de la carrera del plan en el periodo indicado.
   * @param {{ gestionPlanId: number, periodoId: number, page?: number, limit?: number }} params
   */
  async listarParalelosAsignacion(params) {
    try {
      const response = await apiClient.get(DOCENTES_ENDPOINTS.PARALELOS_DISPONIBLES, { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al listar paralelos');
    }
  }

  /**
   * Cursos ofertados en un paralelo (selección para asignación).
   * @param {{ paraleloId: number, page?: number, limit?: number }} params
   */
  async listarCursosPorParaleloAsignacion(params) {
    try {
      const response = await apiClient.get(DOCENTES_ENDPOINTS.CURSOS_POR_PARALELO, { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al listar cursos del paralelo');
    }
  }

  /**
   * Bloques de horario y aulas de un curso (solo lectura).
   * @param {number} cursoId
   */
  async obtenerHorariosCursoAsignacion(cursoId) {
    try {
      const response = await apiClient.get(DOCENTES_ENDPOINTS.CURSO_HORARIOS(cursoId));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener horarios del curso');
    }
  }

  async actualizar(id, data) {
    try {
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return {
          success: false,
          error: 'ID del docente es requerido',
        };
      }
      const response = await apiClient.put(DOCENTES_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar docente');
    }
  }
}

export default new DocenteRepository();
