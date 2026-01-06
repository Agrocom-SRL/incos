/**
 * Implementación del Repositorio de Estudiantes
 * Implementa IEstudianteRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para estudiantes
 * Liskov Substitution Principle: Puede reemplazar IEstudianteRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IEstudianteRepository } from '@domain/repositories';
import { ESTUDIANTES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@config/api/responseHandler';

export class EstudianteRepository extends IEstudianteRepository {
  /**
   * Obtiene la lista de estudiantes con filtros y paginación
   * GET /v1/estudiantes?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(ESTUDIANTES_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener estudiantes');
    }
  }


  /**
   * Obtiene un estudiante por ID
   * GET /v1/estudiantes/:id
   * 
   * @param {string|number} id - ID del estudiante
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerPorId(id) {
    try {
      // Validar que el ID sea válido
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return {
          success: false,
          error: 'ID del estudiante es requerido',
        };
      }

      // Llamada HTTP directa al endpoint usando BY_ID que usa BASE
      const response = await apiClient.get(ESTUDIANTES_ENDPOINTS.BY_ID(id));

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener estudiante');
    }
  }

  /**
   * Crea un nuevo estudiante
   * POST /v1/estudiantes
   * 
   * @param {Object} data - Datos del estudiante a crear
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async crear(data) {
    try {
      // Llamada HTTP directa al endpoint
      const response = await apiClient.post(ESTUDIANTES_ENDPOINTS.BASE, data);

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear estudiante');
    }
  }

}

export default new EstudianteRepository();

