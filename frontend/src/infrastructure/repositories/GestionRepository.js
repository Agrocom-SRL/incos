/**
 * Implementación del Repositorio de Gestiones
 * Implementa IGestionRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para gestiones
 * Liskov Substitution Principle: Puede reemplazar IGestionRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IGestionRepository } from '@domain/repositories';
import { GESTIONES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class GestionRepository extends IGestionRepository {
  /**
   * Obtiene la lista de gestiones con filtros y paginación
   * GET /v1/gestiones?page=1&limit=50&search=...&vigente=0|1
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @param {boolean} options.params.vigente - Filtrar por vigencia (true = vigentes, false = no vigentes)
   * @param {Object} options.params.filters - Filtros en JSON (alternativa a vigente directo)
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Construir query params para el endpoint
      const queryParams = {};
      
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.search) queryParams.search = params.search;
      
      // Filtro vigente como query directo (?vigente=0 | ?vigente=1)
      if (params.vigente !== undefined) {
        queryParams.vigente = params.vigente ? 1 : 0;
      }
      
      // Filtros adicionales en JSON (opcional)
      if (params.filters && Object.keys(params.filters).length > 0) {
        queryParams.filtros = typeof params.filters === 'object'
          ? JSON.stringify(params.filters)
          : params.filters;
      }

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(GESTIONES_ENDPOINTS.BASE, { params: queryParams });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener gestiones');
    }
  }

}

export default new GestionRepository();
