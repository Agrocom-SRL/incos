/**
 * Use Case: Generar Recibo de Pago
 * 
 * Single Responsibility: Orquestar la generación/obtención del recibo de pago
 * Dependency Inversion: Depende de la abstracción IPagoAporteRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Generar u obtener el recibo de pago de un aporte académico
 * - Verifica si el recibo ya existe, si no lo genera
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 */

import { IPagoAporteRepository } from '@repositories/IPagoAporteRepository';

export class GenerarReciboPagoUseCase {
  /**
   * @param {IPagoAporteRepository} pagoAporteRepository - Repositorio de pagos de aportes
   */
  constructor(pagoAporteRepository) {
    this.pagoAporteRepository = pagoAporteRepository;
  }

  /**
   * Ejecuta el caso de uso de generar/obtener recibo de pago
   * 
   * @param {string|number} id - ID del pago
   * @returns {Promise<{success: boolean, data?: {filePath: string, fileName: string, absolutePath: string}, error?: string}>}
   */
  async ejecutar(id) {
    try {
      // Validar que el ID sea válido
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return {
          success: false,
          error: 'ID del pago es requerido',
        };
      }

      // El repositorio hace la llamada HTTP
      // GET /v1/pagos-aportes/:id/recibo
      const result = await this.pagoAporteRepository.generarRecibo(id);
      
      // Si hay error en el repositorio, retornarlo
      if (!result.success) {
        return result;
      }

      // Retornar datos directamente del backend
      // El backend retorna: { filePath, fileName, absolutePath }
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al generar recibo de pago',
      };
    }
  }
}
