/**
 * Implementación del Repositorio de Cursos de Capacitación (módulo CAP)
 * Implementa ICursoCapacitacionRepository usando API client
 *
 * Single Responsibility: Solo maneja llamadas HTTP para cursos de capacitación
 * Liskov Substitution Principle: Puede reemplazar ICursoCapacitacionRepository
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend (camelCase, mappers CAP del backend)
 */

import apiClient from '@api-client';
import { ICursoCapacitacionRepository } from '@domain/repositories';
import { CURSOS_CAPACITACION_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class CursoCapacitacionRepository extends ICursoCapacitacionRepository {
  /**
   * Obtiene la lista de cursos de capacitación (vista 155) con filtros y paginación.
   * GET /v1/cursos-capacitacion?page=&limit=&search=&estado=&incluirInactivos=
   *
   * @param {Object} options - { params: { page, limit, search, estado, incluirInactivos } }
   * @returns {Promise<{success: boolean, data?: Array, pagination?: Object, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(CURSOS_CAPACITACION_ENDPOINTS.BASE, { params });
      const result = handleSuccessResponse(response);
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener los cursos de capacitación');
    }
  }

  /**
   * Obtiene la ficha de un curso (vista 155 + bloques de la 154, con horarios[]
   * y horarioIds[] para precargar el formulario de edición).
   * GET /v1/cursos-capacitacion/:id
   */
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(CURSOS_CAPACITACION_ENDPOINTS.BY_ID(id));
      const result = handleSuccessResponse(response);
      // La ficha es un resultado "complejo": el backend puede devolverla plana
      // (sin envolver en { cursoCapacitacion }). Normalizamos al dataKey del contrato.
      if (result.success && result.data && !result.data.cursoCapacitacion) {
        result.data = { cursoCapacitacion: result.data };
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el curso de capacitación');
    }
  }

  /**
   * Crea un curso de capacitación (acepta horarioIds[] para la junction).
   * POST /v1/cursos-capacitacion
   */
  async crear(data) {
    try {
      const response = await apiClient.post(CURSOS_CAPACITACION_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear el curso de capacitación');
    }
  }

  /**
   * Actualiza un curso; si el payload trae horarioIds[] REEMPLAZA la junction.
   * PUT /v1/cursos-capacitacion/:id
   */
  async actualizar(id, data) {
    try {
      const response = await apiClient.put(CURSOS_CAPACITACION_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el curso de capacitación');
    }
  }

  /**
   * Cambia el estado activo/inactivo de un curso (patrón EstadoTogglePill).
   * PATCH /v1/cursos-capacitacion/:id/estado
   *
   * @param {string|number} id
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async cambiarEstado(id, activo) {
    try {
      const response = await apiClient.patch(CURSOS_CAPACITACION_ENDPOINTS.ESTADO(id), { activo });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al cambiar el estado del curso de capacitación');
    }
  }

  /**
   * Bloques `horarios` (tipo_horario='CLASES') disponibles para un aula, con
   * `ocupado` si ya los usa un paralelo académico u otro curso de capacitación
   * en esa misma aula. `excludeCursoId` (modo edición) evita marcar como
   * ocupados los bloques ya elegidos por el propio curso.
   * GET /v1/cursos-capacitacion/horarios-disponibles?aulaId=&excludeCursoId=
   */
  async obtenerHorariosDisponibles({ aulaId, excludeCursoId } = {}) {
    try {
      const response = await apiClient.get(
        CURSOS_CAPACITACION_ENDPOINTS.HORARIOS_DISPONIBLES(aulaId, excludeCursoId),
      );
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener los horarios disponibles');
    }
  }

  /**
   * Abre las inscripciones del curso: PROPUESTO→ABIERTO (patrón cambiarEstado, sin body).
   * POST /v1/cursos-capacitacion/:id/abrir
   */
  async abrirInscripciones(id) {
    try {
      const response = await apiClient.post(CURSOS_CAPACITACION_ENDPOINTS.ABRIR(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al abrir las inscripciones del curso');
    }
  }

  /**
   * Cancela el curso desde PROPUESTO/ABIERTO efectivo.
   * POST /v1/cursos-capacitacion/:id/cancelar
   */
  async cancelarCurso(id) {
    try {
      const response = await apiClient.post(CURSOS_CAPACITACION_ENDPOINTS.CANCELAR(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al cancelar el curso de capacitación');
    }
  }

  /**
   * Elimina (soft delete) un curso; el backend bloquea si tiene inscritos vigentes.
   * DELETE /v1/cursos-capacitacion/:id
   */
  async eliminar(id) {
    try {
      const response = await apiClient.delete(CURSOS_CAPACITACION_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar el curso de capacitación');
    }
  }
}

export default new CursoCapacitacionRepository();
