/**
 * Implementación del Repositorio de Inscripciones
 * Implementa IInscripcionRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para inscripciones
 * Liskov Substitution Principle: Puede reemplazar IInscripcionRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IInscripcionRepository } from '@domain/repositories';
import { INSCRIPCIONES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class InscripcionRepository extends IInscripcionRepository {
  /**
   * Obtiene la lista de inscripciones con filtros y paginación
   * GET /v1/inscripciones?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(INSCRIPCIONES_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener inscripciones');
    }
  }

  /**
   * Obtiene una inscripción por ID
   * GET /v1/inscripciones/:id
   * 
   * @param {string|number} id - ID de la inscripción
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerPorId(id) {
    try {
      // Validar que el ID sea válido
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return {
          success: false,
          error: 'ID de la inscripción es requerido',
        };
      }

      // Llamada HTTP directa al endpoint usando BY_ID
      const response = await apiClient.get(INSCRIPCIONES_ENDPOINTS.BY_ID(id));

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener inscripción');
    }
  }

  /**
   * Crea una nueva inscripción
   * POST /v1/inscripciones
   * 
   * Body: { student_id, parallel_id, enrollment_type?, observations? }
   * El backend recupera todos los datos necesarios y crea los registros en las tablas correspondientes
   * 
   * @param {Object} data - Datos de la inscripción a crear
   * @param {number} data.student_id - ID del estudiante (requerido)
   * @param {number} data.parallel_id - ID del paralelo (requerido)
   * @param {string} [data.enrollment_type] - Tipo de inscripción (NUEVO, ANTIGUO, TRASPASO, TRANSITABILIDAD, etc.) - opcional
   * @param {string} [data.observations] - Observaciones (opcional)
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Object}>}
   */
  async crear(data) {
    try {
      // Llamada HTTP directa al endpoint
      const response = await apiClient.post(INSCRIPCIONES_ENDPOINTS.BASE, data);

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear inscripción');
    }
  }

  /**
   * Actualiza una inscripción existente
   * PUT /v1/inscripciones/:id
   *
   * @param {string|number} id - ID de la inscripción a actualizar
   * @param {Object} data - Datos a actualizar (observations, enrollment_date, parallel_id o parallel_ids_by_period + materia_ids_by_period)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async actualizar(id, data) {
    try {
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return {
          success: false,
          error: 'ID de la inscripción es requerido',
        };
      }

      const response = await apiClient.put(INSCRIPCIONES_ENDPOINTS.BY_ID(id), data);
      const result = handleSuccessResponse(response);
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar inscripción');
    }
  }

  /**
   * Reemplaza historial_previo de una inscripción.
   * PUT /v1/inscripciones/:id/historial-previo
   *
   * @param {string|number} id
   * @param {{ prior_history: Array }} data
   */
  async guardarHistorialPrevio(id, data) {
    try {
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return { success: false, error: 'ID de la inscripción es requerido' };
      }
      if (!data?.prior_history || !Array.isArray(data.prior_history)) {
        return { success: false, error: 'prior_history es requerido' };
      }

      const response = await apiClient.put(INSCRIPCIONES_ENDPOINTS.HISTORIAL_PREVIO(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al guardar historial previo');
    }
  }

  /**
   * Elimina una inscripción (soft delete)
   * DELETE /v1/inscripciones/:id
   * 
   * Elimina la inscripción y todas sus relaciones:
   * - matriculas_materia (materias de la gestión)
   * - historial_previo (materias concluidas al inscribir)
   * - boletas de inscripción (documentos físicos y registros en BD)
   * 
   * @param {string|number} id - ID de la inscripción a eliminar
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async eliminar(id) {
    try {
      // Validar que el ID sea válido
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return {
          success: false,
          error: 'ID de la inscripción es requerido',
        };
      }

      // Llamada HTTP directa al endpoint
      const response = await apiClient.delete(INSCRIPCIONES_ENDPOINTS.BY_ID(id));

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar inscripción');
    }
  }

  /**
   * Busca inscripciones por término de búsqueda
   * GET /v1/inscripciones?busqueda=termino
   * 
   * @param {string} terminoBusqueda - Término de búsqueda (texto libre)
   * @param {Object} options - Opciones opcionales
   * @param {Object} options.params - Parámetros adicionales de consulta HTTP
   * @param {number} options.params.limit - Límite de resultados (opcional)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async buscar(terminoBusqueda, options = {}) {
    try {
      const { params = {} } = options;
      
      // Construir parámetros de consulta
      const queryParams = {
        busqueda: terminoBusqueda,
        ...(params.limit && { limit: params.limit }),
      };

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(INSCRIPCIONES_ENDPOINTS.BASE, { params: queryParams });

      // Procesar respuesta usando handleSuccessResponse
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al buscar inscripciones');
    }
  }

  /**
   * Cuenta inscripciones según filtros
   * GET /v1/inscripciones/contar?filtros=...
   * 
   * TODO: Este endpoint aún no está implementado en el backend
   * Por ahora retorna un error indicando que no está disponible
   * 
   * @param {Object} filtros - Filtros opcionales
   * @param {boolean} filtros.incluirInactivos - Incluir registros inactivos en el conteo
   * @returns {Promise<{success: boolean, data?: number, error?: string}>}
   */
  async contar(filtros = {}) {
    try {
      // TODO: Cuando el backend implemente GET /inscripciones/contar, usar:
      // const response = await apiClient.get(INSCRIPCIONES_ENDPOINTS.BASE + '/contar', { params: filtros });
      
      // Por ahora, retornar error indicando que no está disponible
      return {
        success: false,
        error: 'El endpoint de conteo aún no está implementado en el backend',
      };
    } catch (error) {
      return handleErrorResponse(error, 'Error al contar inscripciones');
    }
  }

  /**
   * Activa el cursado de una inscripción: sus matrículas pasan INSCRITO → CURSANDO
   * y se abren sus bimestres.
   * PATCH /v1/inscripciones/:id/activar-cursado
   *
   * @param {string|number} id - ID de la inscripción
   * @returns {Promise<{success: boolean, data?: Object, error?: string, code?: string}>}
   */
  async cambiarEstadoCursado(id) {
    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
      return {
        success: false,
        error: 'ID de la inscripción es requerido',
      };
    }

    try {
      const response = await apiClient.patch(INSCRIPCIONES_ENDPOINTS.ACTIVAR_CURSADO(id));
      return handleSuccessResponse(response);
    } catch (error) {
      const mapped = handleErrorResponse(error, 'Error al activar el cursado de la inscripción');
      if (error?.response?.data?.code) mapped.code = error.response.data.code;
      return mapped;
    }
  }
}

export default new InscripcionRepository();
