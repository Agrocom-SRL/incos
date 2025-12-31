/**
 * Implementación del Repositorio de Materias
 * Implementa IMateriaRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para materias
 * Liskov Substitution Principle: Puede reemplazar IMateriaRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IMateriaRepository } from '@domain/repositories';
import { MATERIAS_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@config/api/responseHandler';

export class MateriaRepository extends IMateriaRepository {
  /**
   * Obtiene la lista de materias con filtros y paginación
   * GET /v1/materias?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(MATERIAS_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener materias');
    }
  }

}

export default new MateriaRepository();

