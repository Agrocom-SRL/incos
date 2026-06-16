/**
 * Repositorio HTTP — módulo Asistencia (Académico · ítem ACA-ASI).
 * Mis cursos + coordinación (elegir docente). Gemelo de CalificacionRepository.
 */

import apiClient from '@api-client';
import { ASISTENCIA_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse } from '@api/responseHandler';

class AsistenciaRepository {
  /**
   * GET /v1/asistencia/coordinacion/docentes
   * @param {{ q?: string, limit?: number, preliminar?: boolean }} options
   */
  async listarCoordinacionDocentes(options = {}) {
    try {
      const { q = '', limit, preliminar } = options;
      const params = {};
      if (preliminar) {
        params.preliminar = '1';
      } else if (String(q).trim().length >= 2) {
        params.q = String(q).trim();
      } else {
        params.preliminar = '1';
      }
      if (limit != null) params.limit = limit;

      const response = await apiClient.get(ASISTENCIA_ENDPOINTS.COORDINACION_DOCENTES, { params });
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
          gestionVigente: payload.gestionVigente ?? null,
          bimestreVigente: payload.bimestreVigente ?? null,
          docentes: Array.isArray(payload.docentes) ? payload.docentes : [],
        },
      };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar docentes de coordinación');
    }
  }

  /**
   * GET /v1/asistencia/mis-cursos
   */
  async listarMisCursos() {
    try {
      const response = await apiClient.get(ASISTENCIA_ENDPOINTS.MIS_CURSOS);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar tus cursos');
    }
  }

  /**
   * GET /v1/asistencia/coordinacion/docentes/:docenteId/cursos
   */
  async listarCursosDocenteCoordinacion(docenteId) {
    try {
      const response = await apiClient.get(
        ASISTENCIA_ENDPOINTS.COORDINACION_DOCENTE_CURSOS(docenteId),
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar los cursos del docente');
    }
  }

  // ============================================
  // Toma de asistencia (modelo sesiones_clase)
  // ============================================

  /**
   * GET calendario mensual del bimestre activo (días tomados, neutros, futuros).
   * @param {number|string} asignacionId
   * @param {{ bimestre?: number|string }} [options]
   */
  async getCalendario(asignacionId, { bimestre } = {}) {
    try {
      const params = {};
      if (bimestre != null) params.bimestre = bimestre;
      const response = await apiClient.get(ASISTENCIA_ENDPOINTS.CALENDARIO(asignacionId), { params });
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar el calendario de asistencia');
    }
  }

  /**
   * GET planilla semanal (roster × días del rango).
   * @param {number|string} asignacionId
   * @param {{ desde: string, hasta: string }} rango
   */
  async getPlanilla(asignacionId, { desde, hasta } = {}) {
    try {
      const params = {};
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      const response = await apiClient.get(ASISTENCIA_ENDPOINTS.PLANILLA(asignacionId), { params });
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar la planilla de asistencia');
    }
  }

  /**
   * PUT planilla — upsert de sesiones + marcas sparse (transaccional).
   * @param {number|string} asignacionId
   * @param {{ dias: Array<{ fechaClase: string, esEspecial?: boolean, motivo?: string,
   *   horaInicio?: string, horaFin?: string, marcas: Array<{ matriculaMateriaId: number, estado: string }> }> }} payload
   */
  async guardarPlanilla(asignacionId, { dias } = {}) {
    try {
      const response = await apiClient.put(ASISTENCIA_ENDPOINTS.PLANILLA(asignacionId), {
        dias: Array.isArray(dias) ? dias : [],
      });
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al guardar la planilla de asistencia');
    }
  }

  /**
   * POST cerrar registro del bimestre (lote de sesiones).
   * @param {number|string} asignacionId
   * @param {{ bimestre?: number|string }} [options]
   */
  async cerrarRegistro(asignacionId, { bimestre } = {}) {
    try {
      const params = {};
      if (bimestre != null) params.bimestre = bimestre;
      const response = await apiClient.post(
        ASISTENCIA_ENDPOINTS.REGISTRO_CERRAR(asignacionId),
        null,
        { params },
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cerrar el registro de asistencia');
    }
  }

  /**
   * POST reabrir registro del bimestre (lote de sesiones).
   * @param {number|string} asignacionId
   * @param {{ bimestre?: number|string }} [options]
   */
  async reabrirRegistro(asignacionId, { bimestre } = {}) {
    try {
      const params = {};
      if (bimestre != null) params.bimestre = bimestre;
      const response = await apiClient.post(
        ASISTENCIA_ENDPOINTS.REGISTRO_REABRIR(asignacionId),
        null,
        { params },
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al reabrir el registro de asistencia');
    }
  }

  /**
   * POST crear sesión especial (taller/recuperación; permite fecha futura).
   * @param {number|string} asignacionId
   * @param {{ fecha: string, motivo: string, horaInicio?: string, horaFin?: string }} payload
   */
  async crearSesionEspecial(asignacionId, { fecha, motivo, horaInicio, horaFin } = {}) {
    try {
      const body = { fecha, motivo };
      if (horaInicio) body.horaInicio = horaInicio;
      if (horaFin) body.horaFin = horaFin;
      const response = await apiClient.post(
        ASISTENCIA_ENDPOINTS.SESIONES_ESPECIALES(asignacionId),
        body,
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al habilitar la fecha especial');
    }
  }

  /**
   * DELETE eliminar sesión especial (solo si no tiene asistencia tomada).
   * @param {number|string} asignacionId
   * @param {string} fecha YYYY-MM-DD
   */
  async eliminarSesionEspecial(asignacionId, fecha) {
    try {
      const response = await apiClient.delete(
        ASISTENCIA_ENDPOINTS.SESION_ESPECIAL_ELIMINAR(asignacionId, fecha),
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar la fecha especial');
    }
  }
}

export default new AsistenciaRepository();
