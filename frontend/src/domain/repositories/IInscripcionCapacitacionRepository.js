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
   * Corrige la inscripción (PUT /:id, capacitacion.inscripcion EDITAR): datos del
   * participante y/o grupo; solo los campos que cambiaron.
   * @param {string|number} _inscripcionId
   * @param {Object} _payload - { participante?, capacitacionGrupoId? }
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async actualizar(_inscripcionId, _payload) {
    throw new Error('Método actualizar debe ser implementado');
  }

  /**
   * Corrige un pago (PUT /:id/pagos/:pagoId, EDITAR). Body parcial.
   * @param {string|number} _inscripcionId
   * @param {string|number} _pagoId
   * @param {Object} _payload
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async actualizarPago(_inscripcionId, _pagoId, _payload) {
    throw new Error('Método actualizarPago debe ser implementado');
  }

  /**
   * Anula un pago, definitivo (POST /:id/pagos/:pagoId/anular, EDITAR).
   * @param {string|number} _inscripcionId
   * @param {string|number} _pagoId
   * @param {string} _motivo - 3 a 500 caracteres
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async anularPago(_inscripcionId, _pagoId, _motivo) {
    throw new Error('Método anularPago debe ser implementado');
  }

  /**
   * Reemplaza el checklist de requisitos entregados (PUT /:id/requisitos, EDITAR).
   * @param {string|number} _inscripcionId
   * @param {Array} _requisitos - [{ requisitoId, entregado, fechaEntrega?, observacion? }]
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async actualizarRequisitos(_inscripcionId, _requisitos) {
    throw new Error('Método actualizarRequisitos debe ser implementado');
  }

  /**
   * Adjunta o reemplaza el comprobante de un pago (POST multipart `comprobante`).
   * @param {string|number} _inscripcionId
   * @param {string|number} _pagoId
   * @param {File} _archivo
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async adjuntarComprobante(_inscripcionId, _pagoId, _archivo) {
    throw new Error('Método adjuntarComprobante debe ser implementado');
  }

  /**
   * Descarga el comprobante de un pago (GET, permiso capacitacion.inscripcion DETALLE).
   * @param {string|number} _inscripcionId
   * @param {string|number} _pagoId
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarComprobante(_inscripcionId, _pagoId) {
    throw new Error('Método descargarComprobante debe ser implementado');
  }

  /**
   * Descarga el formulario de inscripción en PDF (GET, capacitacion.inscripcion DETALLE).
   * @param {string|number} _inscripcionId
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarFormularioPdf(_inscripcionId) {
    throw new Error('Método descargarFormularioPdf debe ser implementado');
  }

  /**
   * Descarga el recibo de un pago en PDF (GET, capacitacion.inscripcion DETALLE).
   * @param {string|number} _inscripcionId
   * @param {string|number} _pagoId
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarReciboPdf(_inscripcionId, _pagoId) {
    throw new Error('Método descargarReciboPdf debe ser implementado');
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
