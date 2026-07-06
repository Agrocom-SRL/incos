/**
 * Implementación del Repositorio de Documentación
 * Implementa IDocumentacionRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para documentación
 * Liskov Substitution Principle: Puede reemplazar IDocumentacionRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IDocumentacionRepository } from '@domain/repositories';
import { DOCUMENTACION_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class DocumentacionRepository extends IDocumentacionRepository {
  /**
   * Obtiene la lista de documentación con filtros y paginación
   * GET /v1/documentacion?tipoDocumento=INSCRIPCION&pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @param {string} options.params.tipoDocumento - Filtrar documentación por tipo (INSCRIPCION, LICENCIA, PASANTIA, etc.) (opcional)
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(DOCUMENTACION_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener documentación');
    }
  }

  /**
   * Obtiene un tipo de documentación por ID
   * GET /v1/documentacion/:id
   */
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(DOCUMENTACION_ENDPOINTS.BY_ID(id));
      const result = handleSuccessResponse(response);
      // El backend puede devolver el registro plano (sin envolver en { documentacion })
      if (result.success && result.data && !result.data.documentacion) {
        result.data = { documentacion: result.data };
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el tipo de documentación');
    }
  }

  /**
   * Crea un tipo de documentación
   * POST /v1/documentacion
   */
  async crear(data) {
    try {
      const response = await apiClient.post(DOCUMENTACION_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear el tipo de documentación');
    }
  }

  /**
   * Actualiza un tipo de documentación
   * PUT /v1/documentacion/:id
   */
  async actualizar(id, data) {
    try {
      const response = await apiClient.put(DOCUMENTACION_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el tipo de documentación');
    }
  }

  /**
   * Elimina (soft delete) un tipo de documentación
   * DELETE /v1/documentacion/:id
   */
  async eliminar(id) {
    try {
      const response = await apiClient.delete(DOCUMENTACION_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar el tipo de documentación');
    }
  }
}

export default new DocumentacionRepository();
