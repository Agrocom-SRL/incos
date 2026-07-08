/**
 * Implementación del Repositorio de Tipos de Parentesco
 * Implementa ITipoParentescoRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para tipos de parentesco
 * Liskov Substitution Principle: Puede reemplazar ITipoParentescoRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { ITipoParentescoRepository } from '@domain/repositories';
import { TIPOS_PARENTESCO_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class TipoParentescoRepository extends ITipoParentescoRepository {
  /**
   * Obtiene la lista de tipos de parentesco con filtros y paginación
   * GET /v1/tipos-parentesco?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(TIPOS_PARENTESCO_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener tipos de parentesco');
    }
  }

  /**
   * Obtiene un tipo de parentesco por ID
   * GET /v1/tipos-parentesco/:id
   */
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(TIPOS_PARENTESCO_ENDPOINTS.BY_ID(id));
      const result = handleSuccessResponse(response);
      // El backend puede devolver el registro plano (sin envolver en { tipoParentesco })
      if (result.success && result.data && !result.data.tipoParentesco) {
        result.data = { tipoParentesco: result.data };
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el tipo de parentesco');
    }
  }

  /**
   * Crea un tipo de parentesco
   * POST /v1/tipos-parentesco
   */
  async crear(data) {
    try {
      const response = await apiClient.post(TIPOS_PARENTESCO_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear el tipo de parentesco');
    }
  }

  /**
   * Actualiza un tipo de parentesco
   * PUT /v1/tipos-parentesco/:id
   */
  async actualizar(id, data) {
    try {
      const response = await apiClient.put(TIPOS_PARENTESCO_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el tipo de parentesco');
    }
  }

  /**
   * Cambia el estado activo/inactivo de un tipo de parentesco
   * PATCH /v1/tipos-parentesco/:id/estado
   *
   * @param {string|number} id
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async cambiarEstado(id, activo) {
    try {
      const response = await apiClient.patch(TIPOS_PARENTESCO_ENDPOINTS.ESTADO(id), { activo });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al cambiar el estado del tipo de parentesco');
    }
  }

  /**
   * Elimina (soft delete) un tipo de parentesco
   * DELETE /v1/tipos-parentesco/:id
   */
  async eliminar(id) {
    try {
      const response = await apiClient.delete(TIPOS_PARENTESCO_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar el tipo de parentesco');
    }
  }
}

export default new TipoParentescoRepository();

