/**
 * Interfaz del Repositorio de Inscripciones de capacitación (módulo CAP)
 * Tabla: capacitacion_inscritos (+ capacitacion_pagos vía POST /:id/pagos)
 *
 * Extiende IBaseRepository con el registro de pagos de la inscripción.
 *
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IInscripcionCapacitacionRepository extends IBaseRepository {
  /**
   * Registra un pago sobre la inscripción (POST /:id/pagos, permiso capacitacion.pago CREAR).
   * @param {string|number} _inscripcionId
   * @param {Object} _payload - { monto, metodoPagoId, cuentaPagoId?, fechaPago?, observaciones? }
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async registrarPago(_inscripcionId, _payload) {
    throw new Error('Método registrarPago debe ser implementado');
  }

  /**
   * Anula la inscripción (POST /:id/anular, permiso capacitacion.inscripcion
   * EDITAR — no existe acción ANULAR en el vocabulario cerrado de permisos).
   * Decisión administrativa manual: el monto ya pagado no se devuelve.
   * @param {string|number} _inscripcionId
   * @param {Object} [_payload] - { observacion? }
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async anular(_inscripcionId, _payload) {
    throw new Error('Método anular debe ser implementado');
  }
}
