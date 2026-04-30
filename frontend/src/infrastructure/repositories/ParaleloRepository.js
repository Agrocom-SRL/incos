/**
 * Implementación del Repositorio de Paralelos
 * Implementa IParaleloRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para paralelos
 * Liskov Substitution Principle: Puede reemplazar IParaleloRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IParaleloRepository } from '@domain/repositories';
import { PARALELOS_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class ParaleloRepository extends IParaleloRepository {
  /**
   * Obtiene la lista de paralelos con filtros y paginación
   * GET /v1/paralelos?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(PARALELOS_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // No forzar data a array: el backend devuelve { paralelos: [...], meta?: ... }
      // y el mapper en useParalelosApi usa normalizeFieldToArray(data, 'paralelos')
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener paralelos');
    }
  }

  /**
   * Obtiene los horarios completos de un paralelo
   * GET /v1/paralelos/:id/schedule
   * 
   * @param {Object} options - Opciones de consulta
   * @param {number} options.parallelId - ID del paralelo
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerHorarios(options = {}) {
    try {
      const { parallelId } = options;

      if (!parallelId) {
        return {
          success: false,
          error: 'ID del paralelo es requerido',
        };
      }

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(PARALELOS_ENDPOINTS.SCHEDULE(parallelId));

      // Procesar respuesta exitosa
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener horarios del paralelo');
    }
  }

  async obtenerParalelosEstadoDashboard(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(PARALELOS_ENDPOINTS.DASHBOARD_PARALELOS_ESTADO, { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener estado de paralelos del dashboard');
    }
  }

  async obtenerAsignaturasSinCursoDashboard(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(PARALELOS_ENDPOINTS.DASHBOARD_ASIGNATURAS_SIN_CURSO, { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener asignaturas sin curso del dashboard');
    }
  }

  async obtenerCapacidadTurnoDashboard(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(PARALELOS_ENDPOINTS.DASHBOARD_CAPACIDAD_TURNO, { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener capacidad por turno del dashboard');
    }
  }

}

export default new ParaleloRepository();
