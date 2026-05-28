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
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

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

      const result = handleSuccessResponse(response);

      // El backend devuelve { materias: [...] }; el mapper usa normalizeFieldToArray
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener materias');
    }
  }

  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(MATERIAS_ENDPOINTS.BY_ID(id));
      const result = handleSuccessResponse(response);
      if (result.success && result.data) {
        result.data = result.data.materia ?? result.data;
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener la materia');
    }
  }

  async crear(data) {
    try {
      const response = await apiClient.post(MATERIAS_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear materia');
    }
  }

  async actualizar(id, data) {
    try {
      const response = await apiClient.put(MATERIAS_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar materia');
    }
  }

  async eliminar(id) {
    try {
      const response = await apiClient.delete(MATERIAS_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar materia');
    }
  }
}

export default new MateriaRepository();

