/**
 * Repositorio HTTP — Nivelación (Académico · /academico/nivelaciones).
 *
 * Cada método desenvuelve el `dataFieldName` literal que devuelve el backend
 * (`paralelos`, la grilla plana del paralelo, `nivelaciones`, `evento`,
 * `nivelacion`) — el contrato dataKey (front) == dataFieldName (back) se
 * resuelve AQUÍ, no en los use cases ni en los hooks. Patrón calcado de
 * `LibroRegistroRepository` (mismo dominio ACA, sin interfaz de dominio,
 * exportado como instancia única).
 */

import apiClient from '@api-client';
import { NIVELACIONES_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse } from '@api/responseHandler';

/** Lee `{success,data,error}` del backend con el manejo estándar de errores. */
const unwrap = (response) => {
  const responseData = response.data;
  if (responseData.success === false) {
    return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
  }
  if (responseData.error) {
    return { success: false, error: responseData.error };
  }
  return { success: true, data: responseData.data ?? {} };
};

class NivelacionRepository {
  /**
   * GET /v1/nivelaciones/pendientes-por-paralelo — conteo por paralelo
   * (selector P1 nivel 1, se fusiona con el dataset compartido de paralelos).
   * @returns {Promise<{success:boolean,data?:Array,error?:string}>}
   */
  async listarPendientesPorParalelo() {
    try {
      const response = await apiClient.get(NIVELACIONES_ENDPOINTS.PENDIENTES_POR_PARALELO);
      const result = unwrap(response);
      if (!result.success) return result;
      return {
        success: true,
        data: Array.isArray(result.data.paralelos) ? result.data.paralelos : [],
      };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar los pendientes de nivelación por paralelo');
    }
  }

  /**
   * GET /v1/nivelaciones?paraleloGestionId=<id> — grilla del paralelo
   * (asignaturas + estudiantes con celdas nota/evento, P1 nivel 2).
   * @param {number} paraleloGestionId
   * @returns {Promise<{success:boolean,data?:Object,error?:string}>}
   */
  async obtenerParalelo(paraleloGestionId) {
    try {
      const response = await apiClient.get(NIVELACIONES_ENDPOINTS.BASE, {
        params: { paraleloGestionId },
      });
      const result = unwrap(response);
      if (!result.success) return result;
      return { success: true, data: result.data ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar la grilla de nivelación del paralelo');
    }
  }

  /**
   * GET /v1/nivelaciones/pendientes — bandeja plana PROGRAMADA/EN_CURSO
   * cruzando todos los paralelos (landing de /aprobar, P3).
   * @returns {Promise<{success:boolean,data?:Array,error?:string}>}
   */
  async listarPendientes() {
    try {
      const response = await apiClient.get(NIVELACIONES_ENDPOINTS.PENDIENTES);
      const result = unwrap(response);
      if (!result.success) return result;
      return {
        success: true,
        data: Array.isArray(result.data.nivelaciones) ? result.data.nivelaciones : [],
      };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar la bandeja de nivelaciones pendientes');
    }
  }

  /**
   * POST /v1/nivelaciones/eventos — evento genérico de historial_matricula
   * (tipos sin nota: bloqueo/cronología). Anclaje mutuamente excluyente:
   * `subjectEnrollmentId` XOR (`enrollmentId` + `planSubjectId`).
   * @param {Object} payload
   * @returns {Promise<{success:boolean,data?:Object,error?:string}>}
   */
  async registrarEvento(payload) {
    try {
      const response = await apiClient.post(NIVELACIONES_ENDPOINTS.EVENTOS, payload);
      const result = unwrap(response);
      if (!result.success) return result;
      return { success: true, data: result.data.evento ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al registrar el evento de historial de matrícula');
    }
  }

  /**
   * POST /v1/nivelaciones/decisiones-administrativas — ABANDONO/RETIRADO
   * (nota forzada, irreversible). Permiso `academico.nivelacion.aprobar`.
   * @param {{ subjectEnrollmentId:number, stateType:'ABANDONO'|'RETIRADO', resultingGrade:number, transitionDate?:string, observations?:string }} payload
   * @returns {Promise<{success:boolean,data?:Object,error?:string}>}
   */
  async registrarDecisionAdministrativa(payload) {
    try {
      const response = await apiClient.post(
        NIVELACIONES_ENDPOINTS.DECISIONES_ADMINISTRATIVAS,
        payload,
      );
      const result = unwrap(response);
      if (!result.success) return result;
      return { success: true, data: result.data.evento ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al registrar la decisión administrativa');
    }
  }

  /**
   * POST /v1/nivelaciones/examenes — programa un examen de nivelación (crea
   * el evento de historial + la fila `nivelaciones` en estado PROGRAMADA).
   * @param {Object} payload
   * @returns {Promise<{success:boolean,data?:{evento:Object,nivelacion:Object},error?:string}>}
   */
  async programarExamen(payload) {
    try {
      const response = await apiClient.post(NIVELACIONES_ENDPOINTS.EXAMENES, payload);
      const result = unwrap(response);
      if (!result.success) return result;
      return {
        success: true,
        data: {
          evento: result.data.evento ?? null,
          nivelacion: result.data.nivelacion ?? null,
        },
      };
    } catch (error) {
      return handleErrorResponse(error, 'Error al programar el examen de nivelación');
    }
  }

  /**
   * PATCH /v1/nivelaciones/examenes/:levelingId/resultado — cierra el examen
   * (transición de estado + nota, si corresponde).
   * @param {number} levelingId
   * @param {{ status:string, levelingGrade?:number, passed?:boolean, observations?:string }} payload
   * @returns {Promise<{success:boolean,data?:Object,error?:string}>}
   */
  async registrarResultadoExamen(levelingId, payload) {
    try {
      const response = await apiClient.patch(
        NIVELACIONES_ENDPOINTS.EXAMEN_RESULTADO(levelingId),
        payload,
      );
      const result = unwrap(response);
      if (!result.success) return result;
      return { success: true, data: result.data.nivelacion ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al registrar el resultado del examen de nivelación');
    }
  }
}

export default new NivelacionRepository();
