/**
 * Use Case: Registrar Pago de Aporte
 * 
 * Single Responsibility: Orquestar el registro de un pago de aporte académico
 * Dependency Inversion: Depende de la abstracción IPagoAporteRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Validación básica de datos antes de enviar al backend
 * - Transformación de datos del frontend al formato del backend
 * - Manejo de errores
 * 
 * El backend realiza las validaciones de negocio (método de pago, cuenta, etc.)
 * 
 * Ubicación: domain/useCases/pagos
 */

import { IPagoAporteRepository } from '@repositories/IPagoAporteRepository';

export class RegisterPagoAporteUseCase {
  /**
   * @param {IPagoAporteRepository} pagoAporteRepository - Repositorio de pagos de aporte
   */
  constructor(pagoAporteRepository) {
    this.pagoAporteRepository = pagoAporteRepository;
  }

  /**
   * Ejecuta el caso de uso de registrar un pago de aporte
   * 
   * @param {Object} data - Datos del pago a registrar
   * @param {number} data.student_id - ID del estudiante (requerido)
   * @param {number} data.payment_method_id - ID del método de pago (requerido, 1=EFECTIVO, 2=QR, 3=TRANSFERENCIA)
   * @param {number|null} data.payment_account_id - ID de la cuenta de pago (NULL para EFECTIVO, opcional para QR, requerido para TRANSFERENCIA)
   * @param {string} data.payment_date - Fecha del pago en formato YYYY-MM-DD (requerido)
   * @param {string|null} data.transaction_number - Número de transacción (requerido para QR/TRANSFERENCIA, opcional para EFECTIVO)
   * @param {string} data.concept - Concepto del pago (requerido)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async ejecutar(data) {
    try {
      // Validaciones básicas en el frontend (el backend también valida)
      if (!data.student_id) {
        return {
          success: false,
          error: 'El ID del estudiante es requerido',
        };
      }

      if (!data.payment_method_id) {
        return {
          success: false,
          error: 'El método de pago es requerido',
        };
      }

      if (!data.payment_date) {
        return {
          success: false,
          error: 'La fecha de pago es requerida',
        };
      }

      if (!data.concept || data.concept.trim().length === 0) {
        return {
          success: false,
          error: 'El concepto del pago es requerido',
        };
      }

      // Validaciones según método de pago
      const paymentMethodId = Number(data.payment_method_id);
      
      if (paymentMethodId === 3) {
        // TRANSFERENCIA (3) requiere cuenta y número de transacción
        if (!data.payment_account_id) {
          return {
            success: false,
            error: 'La cuenta de pago es requerida para método TRANSFERENCIA',
          };
        }
        if (!data.transaction_number || data.transaction_number.trim().length === 0) {
          return {
            success: false,
            error: 'El número de transacción es requerido para método TRANSFERENCIA',
          };
        }
      } else if (paymentMethodId === 2) {
        // QR (2) solo requiere número de transacción (la cuenta está en la imagen del QR)
        if (!data.transaction_number || data.transaction_number.trim().length === 0) {
          return {
            success: false,
            error: 'El número de transacción es requerido para método QR',
          };
        }
      }

      // Llamar al repositorio para registrar el pago
      const result = await this.pagoAporteRepository.registrarPago(data);

      // Si el repositorio retornó un error, retornarlo directamente (ya tiene la estructura correcta)
      if (!result || !result.success) {
        return result;
      }

      return result;
    } catch (error) {
      // Solo capturar errores inesperados (excepciones no manejadas)
      // Si el repositorio retornó un error estructurado, ya fue manejado arriba
      return {
        success: false,
        error: error.message || 'Error al registrar pago de aporte',
      };
    }
  }
}
