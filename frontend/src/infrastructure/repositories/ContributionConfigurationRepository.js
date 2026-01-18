/**
 * Implementación del Repositorio de Configuraciones de Aportes
 * Implementa IContributionConfigurationRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para configuraciones de aportes
 * Liskov Substitution Principle: Puede reemplazar IContributionConfigurationRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IContributionConfigurationRepository } from '@domain/repositories';
import { CONFIGURACION_APORTES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class ContributionConfigurationRepository extends IContributionConfigurationRepository {
  /**
   * Obtiene la lista de configuraciones de aportes con filtros y paginación
   * GET /v1/configuracion-aportes?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(CONFIGURACION_APORTES_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener configuraciones de aportes');
    }
  }

}

export default new ContributionConfigurationRepository();
