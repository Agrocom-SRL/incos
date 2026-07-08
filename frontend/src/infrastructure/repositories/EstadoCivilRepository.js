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

  /**
   * Obtiene un estado civil por ID
   * GET /v1/estados-civiles/:id
   */
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(ESTADOS_CIVILES_ENDPOINTS.BY_ID(id));
      const result = handleSuccessResponse(response);
      // El backend puede devolver el registro plano (sin envolver en { estadoCivil })
      if (result.success && result.data && !result.data.estadoCivil) {
        result.data = { estadoCivil: result.data };
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el estado civil');
    }
  }

  /**
   * Crea un estado civil
   * POST /v1/estados-civiles
   */
  async crear(data) {
    try {
      const response = await apiClient.post(ESTADOS_CIVILES_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear el estado civil');
    }
  }

  /**
   * Actualiza un estado civil
   * PUT /v1/estados-civiles/:id
   */
  async actualizar(id, data) {
    try {
      const response = await apiClient.put(ESTADOS_CIVILES_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el estado civil');
    }
  }

  /**
   * Cambia el estado activo/inactivo de un estado civil
   * PATCH /v1/estados-civiles/:id/estado
   *
   * @param {string|number} id
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async cambiarEstado(id, activo) {
    try {
      const response = await apiClient.patch(ESTADOS_CIVILES_ENDPOINTS.ESTADO(id), { activo });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al cambiar el estado del estado civil');
    }
  }

  /**
   * Elimina (soft delete) un estado civil
   * DELETE /v1/estados-civiles/:id
   */
  async eliminar(id) {
    try {
      const response = await apiClient.delete(ESTADOS_CIVILES_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar el estado civil');
    }
  }
}

export default new EstadoCivilRepository();

