/**
 * Implementación del Repositorio de Participantes de capacitación (módulo CAP)
 * Implementa IParticipanteCapacitacionRepository usando API client
 *
 * Single Responsibility: Solo maneja llamadas HTTP para participantes
 * Liskov Substitution Principle: Puede reemplazar IParticipanteCapacitacionRepository
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IParticipanteCapacitacionRepository } from '@domain/repositories';
import { PARTICIPANTES_CAPACITACION_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class ParticipanteCapacitacionRepository extends IParticipanteCapacitacionRepository {
  /**
   * Obtiene la lista de participantes con búsqueda por CI/nombres/apellidos/celular.
   * GET /v1/participantes?page=&limit=&search=&ci=&incluirInactivos=
   *
   * @param {Object} options - { params: { page, limit, search, ci, incluirInactivos } }
   * @returns {Promise<{success: boolean, data?: Array, pagination?: Object, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(PARTICIPANTES_CAPACITACION_ENDPOINTS.BASE, { params });
      const result = handleSuccessResponse(response);
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener los participantes');
    }
  }

  /**
   * Obtiene la ficha de un participante (datos + sus inscripciones).
   * GET /v1/participantes/:id
   */
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(PARTICIPANTES_CAPACITACION_ENDPOINTS.BY_ID(id));
      const result = handleSuccessResponse(response);
      // Ficha "compleja": puede venir plana; normalizamos al dataKey del contrato.
      if (result.success && result.data && !result.data.participante) {
        result.data = { participante: result.data };
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el participante');
    }
  }

  /**
   * Crea un participante (unicidad CI+expedición validada en el backend).
   * POST /v1/participantes
   */
  async crear(data) {
    try {
      const response = await apiClient.post(PARTICIPANTES_CAPACITACION_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear el participante');
    }
  }

  /**
   * Actualiza un participante.
   * PUT /v1/participantes/:id
   */
  async actualizar(id, data) {
    try {
      const response = await apiClient.put(PARTICIPANTES_CAPACITACION_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el participante');
    }
  }

  /**
   * Elimina (soft delete) un participante; 409 si tiene inscripciones.
   * DELETE /v1/participantes/:id
   */
  async eliminar(id) {
    try {
      const response = await apiClient.delete(PARTICIPANTES_CAPACITACION_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar el participante');
    }
  }
}

export default new ParticipanteCapacitacionRepository();
