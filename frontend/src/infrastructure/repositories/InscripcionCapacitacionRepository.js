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
import { extractFileNameFromDisposition, readBlobErrorMessage } from '@api/binaryDownload';

/** GET binario (PDF): devuelve `{ success, blob, fileName }` o `{ success: false, error }`. */
const getPdf = async (url, fallbackName, defaultError) => {
  try {
    const response = await apiClient.get(url, { responseType: 'blob' });
    const fileName = extractFileNameFromDisposition(
      response.headers?.['content-disposition'] || '',
      fallbackName,
    );
    return { success: true, blob: response.data, fileName };
  } catch (error) {
    const blobMessage = await readBlobErrorMessage(error, defaultError);
    if (blobMessage) return { success: false, error: blobMessage };
    return handleErrorResponse(error, defaultError);
  }
};

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
   * @param {Object|FormData} payload - JSON `{ concepto, monto, metodoPagoId, cuentaPagoId?,
   *   fechaPago?, observaciones? }`, o `FormData` (con campo `comprobante`) si hay archivo;
   *   en ese caso no se fija Content-Type para que axios arme el boundary multipart.
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
   * Corrige la inscripción: datos del participante y/o grupo (permiso
   * capacitacion.inscripcion EDITAR). Solo viajan los campos que cambiaron.
   * PUT /v1/inscripciones-capacitacion/:id
   *
   * @param {string|number} id
   * @param {Object} payload - { participante?: {...}, capacitacionGrupoId? } (al menos uno)
   * @returns {Promise<{success: boolean, data?: {inscripcionCapacitacion: Object}, error?: string}>}
   */
  async actualizar(id, payload) {
    try {
      const response = await apiClient.put(INSCRIPCIONES_CAPACITACION_ENDPOINTS.BY_ID(id), payload);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar la inscripción de capacitación');
    }
  }

  /**
   * Corrige un pago (permiso capacitacion.inscripcion EDITAR). Body parcial.
   * PUT /v1/inscripciones-capacitacion/:id/pagos/:pagoId
   *
   * @param {Object} payload - { concepto?, monto?, fechaPago?, metodoPagoId?, cuentaPagoId?, observaciones? }
   */
  async actualizarPago(id, pagoId, payload) {
    try {
      const response = await apiClient.put(
        INSCRIPCIONES_CAPACITACION_ENDPOINTS.PAGO(id, pagoId),
        payload,
      );
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al corregir el pago de capacitación');
    }
  }

  /**
   * Anula un pago — definitivo, se conserva como historial (permiso
   * capacitacion.inscripcion EDITAR).
   * POST /v1/inscripciones-capacitacion/:id/pagos/:pagoId/anular
   *
   * @param {string} motivo - 3 a 500 caracteres
   */
  async anularPago(id, pagoId, motivo) {
    try {
      const response = await apiClient.post(
        INSCRIPCIONES_CAPACITACION_ENDPOINTS.PAGO_ANULAR(id, pagoId),
        { motivo },
      );
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al anular el pago de capacitación');
    }
  }

  /**
   * Reemplaza el checklist de requisitos entregados (recalcula el estado).
   * PUT /v1/inscripciones-capacitacion/:id/requisitos
   *
   * @param {string|number} id
   * @param {Array} requisitos - [{ requisitoId, entregado, fechaEntrega?, observacion? }]
   */
  async actualizarRequisitos(id, requisitos) {
    try {
      const response = await apiClient.put(INSCRIPCIONES_CAPACITACION_ENDPOINTS.REQUISITOS(id), {
        requisitos,
      });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar los requisitos de la inscripción');
    }
  }

  /**
   * Adjunta o reemplaza el comprobante de un pago ya registrado (multipart).
   * POST /v1/inscripciones-capacitacion/:id/pagos/:pagoId/comprobante
   *
   * @param {string|number} id
   * @param {string|number} pagoId
   * @param {File} archivo - imagen o PDF
   */
  async adjuntarComprobante(id, pagoId, archivo) {
    try {
      const formData = new FormData();
      formData.append('comprobante', archivo);
      const response = await apiClient.post(
        INSCRIPCIONES_CAPACITACION_ENDPOINTS.PAGO_COMPROBANTE(id, pagoId),
        formData,
      );
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al adjuntar el comprobante del pago');
    }
  }

  /**
   * Descarga el comprobante de un pago (permiso capacitacion.inscripcion DETALLE).
   * GET /v1/inscripciones-capacitacion/:id/pagos/:pagoId/comprobante
   *
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarComprobante(id, pagoId) {
    try {
      const response = await apiClient.get(
        INSCRIPCIONES_CAPACITACION_ENDPOINTS.PAGO_COMPROBANTE(id, pagoId),
        { responseType: 'blob' },
      );
      const disposition = response.headers?.['content-disposition'] || '';
      const starMatch = disposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      const quotedMatch = disposition.match(/filename="([^"]+)"/i);
      let fileName = `comprobante_pago_${pagoId}`;
      if (starMatch) {
        try {
          fileName = decodeURIComponent(starMatch[1].replace(/['"]/g, ''));
        } catch {
          fileName = starMatch[1];
        }
      } else if (quotedMatch) {
        fileName = quotedMatch[1];
      }
      return { success: true, blob: response.data, fileName };
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        try {
          const json = JSON.parse(await error.response.data.text());
          const errObj = json?.error;
          const msg = typeof errObj === 'string' ? errObj : errObj?.message || json?.message;
          return { success: false, error: msg || 'Error al descargar el comprobante' };
        } catch {
          return { success: false, error: 'Error al descargar el comprobante' };
        }
      }
      return handleErrorResponse(error, 'Error al descargar el comprobante');
    }
  }

  /**
   * Descarga el formulario de inscripción en PDF (permiso capacitacion.inscripcion DETALLE).
   * GET /v1/inscripciones-capacitacion/:id/formulario-pdf
   *
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  descargarFormularioPdf(id) {
    return getPdf(
      INSCRIPCIONES_CAPACITACION_ENDPOINTS.FORMULARIO_PDF(id),
      `formulario_inscripcion_${id}.pdf`,
      'Error al descargar el formulario de inscripción',
    );
  }

  /**
   * Descarga el recibo de un pago en PDF (permiso capacitacion.inscripcion DETALLE).
   * GET /v1/inscripciones-capacitacion/:id/pagos/:pagoId/recibo-pdf
   *
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  descargarReciboPdf(id, pagoId) {
    return getPdf(
      INSCRIPCIONES_CAPACITACION_ENDPOINTS.PAGO_RECIBO_PDF(id, pagoId),
      `recibo_pago_${pagoId}.pdf`,
      'Error al descargar el recibo de pago',
    );
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

  /**
   * Anula la inscripción — decisión administrativa manual, nunca automática
   * (permiso capacitacion.inscripcion EDITAR — no existe acción ANULAR en el
   * vocabulario cerrado de permisos). El monto ya pagado NO se devuelve; solo
   * cambia el estado a ANULADO. Solo aplica desde PENDIENTE o INSCRITO.
   * POST /v1/inscripciones-capacitacion/:id/anular
   *
   * @param {string|number} id
   * @param {Object} [payload] - { observacion? }
   */
  async anular(id, payload = {}) {
    try {
      const response = await apiClient.post(
        INSCRIPCIONES_CAPACITACION_ENDPOINTS.ANULAR(id),
        payload,
      );
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al anular la inscripción de capacitación');
    }
  }
}

export default new InscripcionCapacitacionRepository();
