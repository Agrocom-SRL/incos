/**
 * Implementación del Repositorio de Estados Civiles
 * Implementa IEstadoCivilRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para estados civiles
 * Liskov Substitution Principle: Puede reemplazar IEstadoCivilRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IEstadoCivilRepository } from '@domain/repositories';
import { ESTADOS_CIVILES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class EstadoCivilRepository extends IEstadoCivilRepository {
  /**
   * Obtiene la lista de estados civiles con filtros y paginación
   * GET /v1/estados-civiles?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(ESTADOS_CIVILES_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener estados civiles');
    }
  }

}

export default new EstadoCivilRepository();

