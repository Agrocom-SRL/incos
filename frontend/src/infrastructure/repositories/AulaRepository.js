/**
 * Implementación del Repositorio de Aulas
 * Implementa IAulaRepository usando API client
 *
 * Single Responsibility: Solo maneja llamadas HTTP para aulas (CRUD de
 * administración, CFG → Recursos académicos, permiso `configuracion.aula`).
 * Liskov Substitution Principle: Puede reemplazar IAulaRepository
 *
 * NOTA: distinto del picker de solo lectura `AULAS_CATALOGO_ENDPOINT`
 * (Institucional/Oferta académica, no se toca).
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IAulaRepository } from '@domain/repositories';
import { AULAS_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class AulaRepository extends IAulaRepository {
  /**
   * Obtiene la lista de aulas con filtros y paginación
   * GET /v1/aulas?categoria=...&incluirInactivos=...
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(AULAS_ENDPOINTS.BASE, { params });
      const result = handleSuccessResponse(response);
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener aulas');
    }
  }

  /**
   * Obtiene un aula por ID
   * GET /v1/aulas/:id
   */
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(AULAS_ENDPOINTS.BY_ID(id));
      const result = handleSuccessResponse(response);
      if (result.success && result.data && !result.data.aula) {
        result.data = { aula: result.data };
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el aula');
    }
  }

  /**
   * Crea un aula
   * POST /v1/aulas
   */
  async crear(data) {
    try {
      const response = await apiClient.post(AULAS_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear el aula');
    }
  }

  /**
   * Actualiza un aula
   * PUT /v1/aulas/:id
   */
  async actualizar(id, data) {
    try {
      const response = await apiClient.put(AULAS_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el aula');
    }
  }

  /**
   * Cambia el estado activo/inactivo de un aula
   * PATCH /v1/aulas/:id/estado
   *
   * @param {string|number} id
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async cambiarEstado(id, activo) {
    try {
      const response = await apiClient.patch(AULAS_ENDPOINTS.ESTADO(id), { activo });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al cambiar el estado del aula');
    }
  }

  /**
   * Elimina (soft delete) un aula
   * DELETE /v1/aulas/:id
   */
  async eliminar(id) {
    try {
      const response = await apiClient.delete(AULAS_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar el aula');
    }
  }
}

export default new AulaRepository();
