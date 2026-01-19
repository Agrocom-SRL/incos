/**
 * Implementación del Repositorio de Pagos de Aporte
 * Implementa IPagoAporteRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para pagos de aporte
 * Liskov Substitution Principle: Puede reemplazar IPagoAporteRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IPagoAporteRepository } from '@domain/repositories';
import { PAGOS_APORTES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class PagoAporteRepository extends IPagoAporteRepository {
  /**
   * Registra un nuevo pago de aporte académico
   * POST /v1/pagos-aportes
   * 
   * @param {Object} data - Datos del pago a registrar
   * @param {number} data.student_id - ID del estudiante
   * @param {number} data.payment_method_id - ID del método de pago (1=EFECTIVO, 2=QR, 3=TRANSFERENCIA)
   * @param {number|null} data.payment_account_id - ID de la cuenta de pago (NULL para EFECTIVO, opcional para QR, requerido para TRANSFERENCIA)
   * @param {string} data.payment_date - Fecha del pago (YYYY-MM-DD)
   * @param {string|null} data.transaction_number - Número de transacción (requerido para QR/TRANSFERENCIA, opcional para EFECTIVO)
   * @param {string} data.concept - Concepto del pago
   * @param {File|null} data.documentoRespaldo - Archivo de documento de respaldo (opcional)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async registrarPago(data) {
    try {
      // Validar datos requeridos
      if (!data.student_id) {
        return {
          success: false,
          error: 'El ID del estudiante es requerido',
        };
      }

      if (!data.payment_method_id) {
        return {
          success: false,
          error: 'El ID del método de pago es requerido',
        };
      }

      if (!data.payment_date) {
        return {
          success: false,
          error: 'La fecha de pago es requerida',
        };
      }

      if (!data.concept) {
        return {
          success: false,
          error: 'El concepto del pago es requerido',
        };
      }

      // Si hay un archivo, usar FormData, sino usar JSON normal
      let requestData;
      let headers = {};

      if (data.documentoRespaldo && data.documentoRespaldo instanceof File) {
        // Usar FormData para enviar archivo
        const formData = new FormData();
        formData.append('student_id', data.student_id);
        formData.append('payment_method_id', data.payment_method_id);
        if (data.payment_account_id) {
          formData.append('payment_account_id', data.payment_account_id);
        }
        formData.append('payment_date', data.payment_date);
        if (data.transaction_number) {
          formData.append('transaction_number', data.transaction_number);
        }
        formData.append('concept', data.concept);
        formData.append('documentoRespaldo', data.documentoRespaldo);

        requestData = formData;
        // No establecer Content-Type, el navegador lo hará automáticamente con el boundary
      } else {
        // Usar JSON normal
        requestData = {
          student_id: data.student_id,
          payment_method_id: data.payment_method_id,
          payment_account_id: data.payment_account_id || null,
          payment_date: data.payment_date,
          transaction_number: data.transaction_number || null,
          concept: data.concept,
        };
        headers['Content-Type'] = 'application/json';
      }

      // Llamada HTTP directa al endpoint
      // Si es FormData, no establecer headers (axios lo hará automáticamente con el boundary)
      const config = data.documentoRespaldo && data.documentoRespaldo instanceof File
        ? {} // Sin headers, axios establecerá Content-Type automáticamente para FormData
        : { headers }; // Para JSON, usar headers con Content-Type

      const response = await apiClient.post(PAGOS_APORTES_ENDPOINTS.BASE, requestData, config);

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al registrar pago de aporte');
    }
  }
}

export default new PagoAporteRepository();
