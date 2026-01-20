/**
 * Implementación del Repositorio de Becas y Descuentos
 * Implementa IBecaDescuentoRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para becas y descuentos
 * Liskov Substitution Principle: Puede reemplazar IBecaDescuentoRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IBecaDescuentoRepository } from '@domain/repositories';
import { BECAS_DESCUENTOS_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class BecaDescuentoRepository extends IBecaDescuentoRepository {
  /**
   * Obtiene la lista de becas y descuentos con filtros y paginación
   * GET /v1/becas-descuentos?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(BECAS_DESCUENTOS_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener becas y descuentos');
    }
  }

  /**
   * Elimina una beca por ID (soft delete)
   * DELETE /v1/becas-descuentos/:id
   * 
   * @param {string|number} id - ID de la beca a eliminar
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async eliminar(id) {
    try {
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return {
          success: false,
          error: 'ID de la beca es requerido',
        };
      }
      const response = await apiClient.delete(BECAS_DESCUENTOS_ENDPOINTS.BY_ID(id));
      const result = handleSuccessResponse(response);
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar beca');
    }
  }

}

export default new BecaDescuentoRepository();
