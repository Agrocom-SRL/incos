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
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

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

      const result = handleSuccessResponse(response);

      // El backend devuelve { carreras: [...] }; el mapper usa normalizeFieldToArray
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener carreras');
    }
  }

  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(CARRERAS_ENDPOINTS.BY_ID(id));
      const result = handleSuccessResponse(response);
      if (result.success && result.data?.carrera) {
        result.data = result.data;
      } else if (result.success && result.data && !result.data.carrera) {
        result.data = { carrera: result.data, periodos: [] };
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener la carrera');
    }
  }

  async crear(data) {
    try {
      const response = await apiClient.post(CARRERAS_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear carrera');
    }
  }

  async actualizar(id, data) {
    try {
      const response = await apiClient.put(CARRERAS_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar carrera');
    }
  }

  async eliminar(id) {
    try {
      const response = await apiClient.delete(CARRERAS_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar carrera');
    }
  }

  async subirImagen(codigo, file) {
    try {
      const formData = new FormData();
      formData.append('codigo', codigo);
      formData.append('imagen', file);
      const response = await apiClient.post(CARRERAS_ENDPOINTS.IMAGEN, formData);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al subir imagen de carrera');
    }
  }
}

export default new CarreraRepository();

