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
      return handleErrorResponse(error, 'Error al cargar sus cursos');
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
  async cerrarRegistro(asignacionId, { bimestre, fecha } = {}) {
    try {
      const params = {};
      if (bimestre != null) params.bimestre = bimestre;
      if (fecha != null) params.fecha = fecha;
      const response = await apiClient.post(
        ASISTENCIA_ENDPOINTS.REGISTRO_CERRAR(asignacionId),
        {},
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
  async reabrirRegistro(asignacionId, { bimestre, fecha } = {}) {
    try {
      const params = {};
      if (bimestre != null) params.bimestre = bimestre;
      if (fecha != null) params.fecha = fecha;
      const response = await apiClient.post(
        ASISTENCIA_ENDPOINTS.REGISTRO_REABRIR(asignacionId),
        {},
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

  // ============================================
  // Licencias estudiantiles (página dentro de Asistencia · ACA-ASI-LIC)
  // ============================================

  /**
   * GET /v1/asistencia/licencias?estado= — listado de licencias (filtro opcional por estado).
   * dataKey backend: { licencias: [...] }.
   * @param {{ estado?: string }} [options]
   */
  async listarLicencias({ estado } = {}) {
    try {
      const params = {};
      if (estado) params.estado = estado;
      const response = await apiClient.get(ASISTENCIA_ENDPOINTS.LICENCIAS, { params });
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar las licencias');
    }
  }

  /**
   * GET /v1/asistencia/licencias/:id — detalle de una licencia. dataKey backend: { licencia }.
   * @param {number|string} id
   */
  async getLicenciaById(id) {
    try {
      const response = await apiClient.get(ASISTENCIA_ENDPOINTS.LICENCIA_BY_ID(id));
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar la licencia');
    }
  }

  /**
   * POST /v1/asistencia/licencias — solicitar una licencia (nace PENDIENTE).
   * @param {{ inscripcionId: number, fechaInicio: string, fechaFin: string,
   *   motivo: string, detalleMotivo: string }} payload
   */
  async crearLicencia({ inscripcionId, fechaInicio, fechaFin, motivo, detalleMotivo } = {}) {
    try {
      const response = await apiClient.post(ASISTENCIA_ENDPOINTS.LICENCIAS, {
        inscripcionId,
        fechaInicio,
        fechaFin,
        motivo,
        detalleMotivo,
      });
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al solicitar la licencia');
    }
  }

  /**
   * PUT /v1/asistencia/licencias/:id/decision — aprobar/rechazar una licencia PENDIENTE.
   * @param {number|string} id
   * @param {{ decision: 'APROBAR'|'RECHAZAR', observacionesDecision?: string }} payload
   *   `observacionesDecision`: campo único (motivo del rechazo / observación de la aprobación).
   */
  async decidirLicencia(id, { decision, observacionesDecision } = {}) {
    try {
      const body = { decision };
      if (observacionesDecision != null) body.observacionesDecision = observacionesDecision;
      const response = await apiClient.put(ASISTENCIA_ENDPOINTS.LICENCIA_DECISION(id), body);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al registrar la decisión de la licencia');
    }
  }

  /**
   * PUT /v1/asistencia/licencias/:id — editar una licencia PENDIENTE.
   * @param {number|string} id
   * @param {{ fechaInicio: string, fechaFin: string, motivo: string, detalleMotivo: string }} payload
   */
  async editarLicencia(id, { fechaInicio, fechaFin, motivo, detalleMotivo } = {}) {
    try {
      const response = await apiClient.put(ASISTENCIA_ENDPOINTS.LICENCIA_UPDATE(id), {
        fechaInicio,
        fechaFin,
        motivo,
        detalleMotivo,
      });
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al editar la licencia');
    }
  }

  /**
   * PUT /v1/asistencia/licencias/:id/cancel — cancelar una licencia PENDIENTE o APROBADA.
   * @param {number|string} id
   * @param {{ observacionesDecision?: string }} [payload] - Motivo de la cancelación (campo único).
   */
  async cancelarLicencia(id, { observacionesDecision } = {}) {
    try {
      const body = {};
      if (observacionesDecision != null) body.observacionesDecision = observacionesDecision;
      const response = await apiClient.put(ASISTENCIA_ENDPOINTS.LICENCIA_CANCEL(id), body);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cancelar la licencia');
    }
  }

  /**
   * GET /v1/asistencia/licencias/inscripcion-vigente?estudianteId= — inscripción vigente
   * del estudiante (resuelve estudiante → inscripcionId para la solicitud de licencia).
   * dataKey backend: { inscripcion: {...} | null }.
   * @param {number|string} estudianteId
   */
  async getInscripcionVigente(estudianteId) {
    try {
      const response = await apiClient.get(
        ASISTENCIA_ENDPOINTS.LICENCIA_INSCRIPCION_VIGENTE(estudianteId),
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al consultar la inscripción vigente del estudiante');
    }
  }
}

export default new AsistenciaRepository();
