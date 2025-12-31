/**
 * Implementación del Repositorio de Carreras
 * Implementa ICarreraRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para carreras
 * Liskov Substitution Principle: Puede reemplazar ICarreraRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { ICarreraRepository } from '@domain/repositories';
import { CARRERAS_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@config/api/responseHandler';

export class CarreraRepository extends ICarreraRepository {
  /**
   * Obtiene la lista de carreras con filtros y paginación
   * GET /v1/carreras?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(CARRERAS_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener carreras');
    }
  }

}

export default new CarreraRepository();

