/**
 * Implementación del Repositorio de Provincias
 * Implementa IProvinciaRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para provincias
 * Liskov Substitution Principle: Puede reemplazar IProvinciaRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IProvinciaRepository } from '@domain/repositories';
import { PROVINCIAS_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@config/api/responseHandler';

export class ProvinciaRepository extends IProvinciaRepository {
  /**
   * Obtiene la lista de provincias con filtros y paginación
   * GET /v1/provincias?departamentoId=1&pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @param {number} options.params.departamentoId - Filtrar provincias por departamento (opcional)
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(PROVINCIAS_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener provincias');
    }
  }

}

export default new ProvinciaRepository();

