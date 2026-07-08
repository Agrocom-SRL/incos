/**
 * Implementación del Repositorio de Cuentas de Pago
 * Implementa IPaymentAccountRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para cuentas de pago
 * Liskov Substitution Principle: Puede reemplazar IPaymentAccountRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IPaymentAccountRepository } from '@domain/repositories';
import { CUENTAS_PAGO_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class PaymentAccountRepository extends IPaymentAccountRepository {
  /**
   * Obtiene la lista de cuentas de pago con filtros y paginación
   * GET /v1/cuentas-pago?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(CUENTAS_PAGO_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener cuentas de pago');
    }
  }

  /**
   * Construye el cuerpo de la petición de cuenta de pago.
   * Si llega un archivo `qr` (File), usa multipart/FormData (espejo de
   * `PagoAporteRepository.registrarPago`); si no, envía JSON plano. Solo se
   * adjuntan los campos definidos (no se mandan `undefined`).
   *
   * @param {Object} data - Campos de la cuenta + `qr` (File opcional)
   * @returns {{ requestData: Object|FormData, config: Object }}
   */
  buildRequest(data = {}) {
    const campos = {
      nombre_titular: data.nombre_titular,
      metodo_pago_id: data.metodo_pago_id,
      banco_id: data.banco_id,
      numero_cuenta: data.numero_cuenta,
      numero_celular: data.numero_celular,
      qr_imagen_url: data.qr_imagen_url,
      activo: data.activo,
    };

    const tieneArchivo = data.qr instanceof File;

    if (tieneArchivo) {
      const formData = new FormData();
      Object.entries(campos).forEach(([clave, valor]) => {
        if (valor !== undefined && valor !== null) {
          formData.append(clave, String(valor));
        }
      });
      formData.append('qr', data.qr);
      // Sin Content-Type: axios fija el boundary del multipart automáticamente.
      return { requestData: formData, config: {} };
    }

    const requestData = {};
    Object.entries(campos).forEach(([clave, valor]) => {
      if (valor !== undefined) {
        requestData[clave] = valor;
      }
    });
    return { requestData, config: { headers: { 'Content-Type': 'application/json' } } };
  }

  /**
   * Crea una cuenta de pago (multipart si se adjunta el QR).
   * POST /v1/cuentas-pago
   *
   * @param {Object} data - { nombre_titular (req), metodo_pago_id?, banco_id?, numero_cuenta?,
   *   numero_celular?, qr_imagen_url?, activo? } + `qr` (File opcional)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>} data.cuentaPago
   */
  async crear(data = {}) {
    try {
      const { requestData, config } = this.buildRequest(data);
      const response = await apiClient.post(CUENTAS_PAGO_ENDPOINTS.BASE, requestData, config);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear la cuenta de pago');
    }
  }

  /**
   * Actualiza una cuenta de pago (multipart si se adjunta el QR).
   * PUT /v1/cuentas-pago/:id
   *
   * @param {string|number} id - ID de la cuenta
   * @param {Object} data - mismos campos opcionales + `qr` (File opcional)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>} data.cuentaPago
   */
  async actualizar(id, data = {}) {
    try {
      if (!id && id !== 0) {
        return { success: false, error: 'ID de la cuenta es requerido' };
      }
      const { requestData, config } = this.buildRequest(data);
      const response = await apiClient.put(CUENTAS_PAGO_ENDPOINTS.BY_ID(id), requestData, config);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar la cuenta de pago');
    }
  }

  /**
   * Elimina (soft delete) una cuenta de pago.
   * DELETE /v1/cuentas-pago/:id
   *
   * @param {string|number} id - ID de la cuenta
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async eliminar(id) {
    try {
      if (!id && id !== 0) {
        return { success: false, error: 'ID de la cuenta es requerido' };
      }
      const response = await apiClient.delete(CUENTAS_PAGO_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar la cuenta de pago');
    }
  }

  /**
   * Cambia el estado activo/inactivo de una cuenta de pago
   * PATCH /v1/cuentas-pago/:id/estado
   *
   * @param {string|number} id
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async cambiarEstado(id, activo) {
    try {
      const response = await apiClient.patch(CUENTAS_PAGO_ENDPOINTS.ESTADO(id), { activo });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al cambiar el estado de la cuenta de pago');
    }
  }

}

export default new PaymentAccountRepository();
