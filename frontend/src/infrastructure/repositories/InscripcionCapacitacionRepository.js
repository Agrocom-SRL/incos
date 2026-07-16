/**
 * Implementación del Repositorio de Inscripciones de capacitación (módulo CAP)
 * Implementa IInscripcionCapacitacionRepository usando API client
 *
 * Single Responsibility: Solo maneja llamadas HTTP para inscripciones y sus pagos
 * Liskov Substitution Principle: Puede reemplazar IInscripcionCapacitacionRepository
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IInscripcionCapacitacionRepository } from '@domain/repositories';
import { INSCRIPCIONES_CAPACITACION_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class InscripcionCapacitacionRepository extends IInscripcionCapacitacionRepository {
  /**
   * Obtiene la lista de inscripciones (participante + curso + estado de pago).
   * GET /v1/inscripciones-capacitacion?page=&limit=&search=&capacitacionId=&participanteId=&estado=&incluirInactivos=
   *
   * @param {Object} options - { params } con los filtros soportados por el backend
   * @returns {Promise<{success: boolean, data?: Array, pagination?: Object, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(INSCRIPCIONES_CAPACITACION_ENDPOINTS.BASE, { params });
      const result = handleSuccessResponse(response);
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener las inscripciones de capacitación');
    }
  }

  /**
   * Obtiene la ficha de una inscripción (participante + curso + historial de pagos).
   * GET /v1/inscripciones-capacitacion/:id
   */
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(INSCRIPCIONES_CAPACITACION_ENDPOINTS.BY_ID(id));
      const result = handleSuccessResponse(response);
      // Ficha "compleja": puede venir plana; normalizamos al dataKey del contrato.
      if (result.success && result.data && !result.data.inscripcionCapacitacion) {
        result.data = { inscripcionCapacitacion: result.data };
      }
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener la inscripción de capacitación');
    }
  }

  /**
   * Inscribe a un participante NUEVO (objeto participante) o EXISTENTE
   * (participanteId) en un curso, con pago inicial opcional — una transacción.
   * POST /v1/inscripciones-capacitacion
   *
   * @param {Object} data - { capacitacionId, participanteId? | participante?, fechaInscripcion?, pagoInicial? }
   */
  async crear(data) {
    try {
      const response = await apiClient.post(INSCRIPCIONES_CAPACITACION_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al inscribir al participante');
    }
  }

  /**
   * Registra un pago de la inscripción (permiso capacitacion.pago CREAR).
   * POST /v1/inscripciones-capacitacion/:id/pagos
   *
   * @param {string|number} inscripcionId
   * @param {Object} payload - { monto, metodoPagoId, cuentaPagoId?, fechaPago?, observaciones? }
   */
  async registrarPago(inscripcionId, payload) {
    try {
      const response = await apiClient.post(
        INSCRIPCIONES_CAPACITACION_ENDPOINTS.PAGOS(inscripcionId),
        payload,
      );
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al registrar el pago de capacitación');
    }
  }

  /**
   * Elimina (soft delete) una inscripción y sus pagos en cascada (queda RETIRADO).
   * DELETE /v1/inscripciones-capacitacion/:id
   */
  async eliminar(id) {
    try {
      const response = await apiClient.delete(INSCRIPCIONES_CAPACITACION_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar la inscripción de capacitación');
    }
  }
}

export default new InscripcionCapacitacionRepository();
