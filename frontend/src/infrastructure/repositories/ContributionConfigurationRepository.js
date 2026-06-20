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

  /**
   * Crea una configuración de aporte (gestión vigente si no se envía gestion_id).
   * POST /v1/configuracion-aportes
   *
   * @param {Object} payload - { monto_base (req), gestion_id?, aporte_activo?, fecha_inicio (req), fecha_fin? }
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>} data.configuracionAporte
   */
  async crear(payload = {}) {
    try {
      const response = await apiClient.post(CONFIGURACION_APORTES_ENDPOINTS.BASE, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear la configuración de aporte');
    }
  }

  /**
   * Actualiza una configuración de aporte existente.
   * PUT /v1/configuracion-aportes/:id
   *
   * @param {string|number} id - ID de la configuración
   * @param {Object} payload - { monto_base?, aporte_activo?, fecha_inicio?, fecha_fin?, activo? }
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>} data.configuracionAporte
   */
  async actualizar(id, payload = {}) {
    try {
      if (!id && id !== 0) {
        return { success: false, error: 'ID de la configuración es requerido' };
      }
      const response = await apiClient.put(CONFIGURACION_APORTES_ENDPOINTS.BY_ID(id), payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar la configuración de aporte');
    }
  }

}

export default new ContributionConfigurationRepository();
