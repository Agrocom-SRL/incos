/**
 * Implementación del Repositorio de Becas de Estudiantes
 * Implementa IEstudianteBecaRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para becas de estudiantes
 * Liskov Substitution Principle: Puede reemplazar IEstudianteBecaRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 * 
 * NOTA: Las asignaciones de becas son un sub-recurso de estudiantes
 * Endpoint base: POST/GET /v1/estudiantes/:studentId/scholarships
 */

import apiClient from '@api-client';
import { IEstudianteBecaRepository } from '@domain/repositories';
import { ESTUDIANTES_BECAS_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class EstudianteBecaRepository extends IEstudianteBecaRepository {
  /**
   * Crea una nueva asignación de beca para un estudiante
   * POST /v1/estudiantes/:studentId/scholarships
   * 
   * Body: { beca_descuento_id, observaciones? }
   * NOTA: El studentId va en el path, no en el body
   * 
   * @param {Object} data - Datos de la asignación de beca a crear
   * @param {number} data.beca_descuento_id - ID de la beca/descuento (requerido)
   * @param {string} [data.observaciones] - Observaciones (opcional, puede ser null, vacío o string)
   * @param {Object} options - Opciones opcionales
   * @param {number} options.studentId - ID del estudiante (requerido para construir la URL)
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Object}>}
   */
  async crear(data, options = {}) {
    try {
      // Extraer studentId de las opciones para construir la URL
      const { studentId } = options;
      
      if (!studentId) {
        return {
          success: false,
          error: 'El ID del estudiante es requerido',
        };
      }
      
      // Preparar body solo con los campos que el backend espera
      // El studentId va en el path, no en el body
      const body = {
        beca_descuento_id: data.beca_descuento_id,
      };
      
      // Solo agregar observaciones si tiene valor
      if (data.observaciones !== undefined && data.observaciones !== null && data.observaciones !== '') {
        body.observaciones = data.observaciones;
      }
      
      // Llamada HTTP directa al endpoint
      // POST /v1/estudiantes/:studentId/scholarships
      const response = await apiClient.post(
        ESTUDIANTES_BECAS_ENDPOINTS.BY_STUDENT_ID(studentId),
        body
      );

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear asignación de beca');
    }
  }

  /**
   * Obtiene todas las asignaciones de becas de un estudiante
   * GET /v1/estudiantes/:studentId/scholarships
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @param {number} options.params.studentId - ID del estudiante (requerido para construir la URL)
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;
      const studentId = params.studentId;

      // Si hay studentId, usar el endpoint específico del estudiante
      if (studentId) {
        // Llamada HTTP directa al endpoint
        const response = await apiClient.get(
          ESTUDIANTES_BECAS_ENDPOINTS.BY_STUDENT_ID(studentId),
          { params }
        );

        // Procesar respuesta exitosa
        const result = handleSuccessResponse(response);

        // El endpoint GET /estudiantes/:id/scholarships retorna un objeto con scholarships y catalogs
        // No forzar array aquí, dejar que el hook lo maneje según el formato de respuesta
        // Si result.data existe y es un objeto, mantenerlo; si es un array (para otros endpoints), mantenerlo también
        
        return result;
      }

      // Si no hay studentId, usar el endpoint para listar todas las becas asignadas
      // GET /v1/estudiantes/becas?page=1&limit=50&search=...
      const response = await apiClient.get(
        ESTUDIANTES_BECAS_ENDPOINTS.LIST_ALL,
        { params }
      );

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener becas del estudiante');
    }
  }

  /**
   * Obtiene una asignación de beca por ID
   * GET /v1/estudiantes/:studentId/scholarships/:id
   * 
   * @param {string|number} id - ID de la asignación de beca
   * @param {Object} options - Opciones opcionales
   * @param {number} options.studentId - ID del estudiante (requerido para construir la URL)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerPorId(id, options = {}) {
    try {
      const { studentId } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(
        ESTUDIANTES_BECAS_ENDPOINTS.BY_STUDENT_AND_ID(studentId, id)
      );

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener asignación de beca');
    }
  }

  /**
   * Detalle de asignación desde el listado global (sin studentId en path).
   * GET /v1/estudiantes/becas/:id
   *
   * @param {string|number} id - ID estudiantes_becas
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerDetalleAsignacionPorId(id) {
    try {
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return { success: false, error: 'El ID de la asignación es requerido' };
      }
      const response = await apiClient.get(ESTUDIANTES_BECAS_ENDPOINTS.DETALLE_ASIGNACION(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener asignación de beca');
    }
  }

  /**
   * Actualiza una asignación de beca existente
   * PUT /v1/estudiantes/:studentId/scholarships/:id
   * 
   * TODO: Este endpoint aún no está implementado en el backend
   * Por ahora retorna un error indicando que no está disponible
   * 
   * @param {string|number} id - ID de la asignación de beca a actualizar
   * @param {Object} data - Datos de la asignación de beca a actualizar
   * @param {Object} options - Opciones opcionales
   * @param {number} options.studentId - ID del estudiante (requerido para construir la URL)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async actualizar(id, data, options = {}) {
    try {
      const { studentId: _studentId } = options;

      // TODO: Cuando el backend implemente PUT /estudiantes/:studentId/scholarships/:id, usar:
      // const response = await apiClient.put(
      //   ESTUDIANTES_BECAS_ENDPOINTS.BY_STUDENT_AND_ID(studentId, id),
      //   data
      // );
      
      // Por ahora, retornar error indicando que no está disponible
      return {
        success: false,
        error: 'El endpoint de actualización aún no está implementado en el backend',
      };
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar asignación de beca');
    }
  }

  /**
   * Elimina una asignación de beca (soft delete)
   * DELETE /v1/estudiantes/becas/:id
   * 
   * @param {string|number} id - ID de la asignación de beca a eliminar (estudiantes_becas.id)
   * @param {Object} options - Opciones opcionales (no se usa studentId, el endpoint es directo)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async eliminar(id, options = {}) {
    try {
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return {
          success: false,
          error: 'El ID de la beca asignada es requerido',
        };
      }

      // Endpoint: DELETE /v1/estudiantes/becas/:id
      const response = await apiClient.delete(
        ESTUDIANTES_BECAS_ENDPOINTS.DELETE(id)
      );

      return handleSuccessResponse(response, 'Beca asignada eliminada exitosamente');
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar asignación de beca');
    }
  }

  /**
   * Busca asignaciones de becas por término de búsqueda
   * GET /v1/estudiantes/:studentId/scholarships?busqueda=termino
   * 
   * @param {string} terminoBusqueda - Término de búsqueda (texto libre)
   * @param {Object} options - Opciones opcionales
   * @param {Object} options.params - Parámetros adicionales de consulta HTTP
   * @param {number} options.params.studentId - ID del estudiante (requerido para construir la URL)
   * @param {number} options.params.limit - Límite de resultados (opcional)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async buscar(terminoBusqueda, options = {}) {
    try {
      const { params = {} } = options;
      const studentId = params.studentId;
      
      // Construir parámetros de consulta
      const queryParams = {
        busqueda: terminoBusqueda,
        ...(params.limit && { limit: params.limit }),
      };

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(
        ESTUDIANTES_BECAS_ENDPOINTS.BY_STUDENT_ID(studentId),
        { params: queryParams }
      );

      // Procesar respuesta usando handleSuccessResponse
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al buscar asignaciones de becas');
    }
  }

  /**
   * Cuenta asignaciones de becas según filtros
   * GET /v1/estudiantes/:studentId/scholarships/contar?filtros=...
   * 
   * TODO: Este endpoint aún no está implementado en el backend
   * Por ahora retorna un error indicando que no está disponible
   * 
   * @param {Object} filtros - Filtros opcionales
   * @param {number} filtros.studentId - ID del estudiante (requerido para construir la URL)
   * @param {boolean} filtros.incluirInactivos - Incluir registros inactivos en el conteo
   * @returns {Promise<{success: boolean, data?: number, error?: string}>}
   */
  async contar(filtros = {}) {
    try {
      const { studentId: _studentId } = filtros;

      // TODO: Cuando el backend implemente GET /estudiantes/:studentId/scholarships/contar, usar:
      // const response = await apiClient.get(
      //   `${ESTUDIANTES_BECAS_ENDPOINTS.BY_STUDENT_ID(studentId)}/contar`,
      //   { params: filtros }
      // );
      
      // Por ahora, retornar error indicando que no está disponible
      return {
        success: false,
        error: 'El endpoint de conteo aún no está implementado en el backend',
      };
    } catch (error) {
      return handleErrorResponse(error, 'Error al contar asignaciones de becas');
    }
  }

  /**
   * Cambia el estado activo/inactivo de una asignación de beca
   * PATCH /v1/estudiantes/:studentId/scholarships/:id/activo
   * 
   * TODO: Este endpoint aún no está implementado en el backend
   * Por ahora retorna un error indicando que no está disponible
   * 
   * @param {string|number} id - ID de la asignación de beca
   * @param {boolean} activo - Nuevo estado (true = activo, false = inactivo)
   * @param {Object} options - Opciones opcionales
   * @param {number} options.studentId - ID del estudiante (requerido para construir la URL)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async cambiarEstado(id, activo, options = {}) {
    try {
      const { studentId: _studentId } = options;

      // TODO: Cuando el backend implemente PATCH /estudiantes/:studentId/scholarships/:id/activo, usar:
      // const response = await apiClient.patch(
      //   `${ESTUDIANTES_BECAS_ENDPOINTS.BY_STUDENT_AND_ID(studentId, id)}/activo`,
      //   { activo }
      // );
      
      // Por ahora, retornar error indicando que no está disponible
      return {
        success: false,
        error: 'El endpoint de cambio de estado aún no está implementado en el backend',
      };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cambiar estado de asignación de beca');
    }
  }
}

export default new EstudianteBecaRepository();
