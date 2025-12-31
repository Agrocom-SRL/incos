/**
 * Implementación del Repositorio de Municipios
 * Implementa IMunicipioRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para municipios
 * Liskov Substitution Principle: Puede reemplazar IMunicipioRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IMunicipioRepository } from '@domain/repositories';
import { MUNICIPIOS_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@config/api/responseHandler';

export class MunicipioRepository extends IMunicipioRepository {
  /**
   * Obtiene la lista de municipios con filtros y paginación
   * GET /v1/municipios?provinciaId=1&pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @param {number} options.params.provinciaId - Filtrar municipios por provincia (opcional)
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(MUNICIPIOS_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener municipios');
    }
  }

}

export default new MunicipioRepository();

