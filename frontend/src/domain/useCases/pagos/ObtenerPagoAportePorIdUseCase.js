/**
 * Use Case: Obtener Pago de Aporte por ID
 * 
 * Single Responsibility: Orquestar la obtención de un pago de aporte por su ID
 * Dependency Inversion: Depende de la abstracción IPagoAporteRepository
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de aplicación (orquesta el repositorio)
 * 
 * Este Use Case maneja:
 * - Obtener un pago por ID con todos sus datos relacionados (estudiante, gestión, método de pago, beca, inscripción)
 * 
 * Retorna datos directamente del backend, sin crear entidades.
 */

import { IPagoAporteRepository } from '@repositories/IPagoAporteRepository';

export class ObtenerPagoAportePorIdUseCase {
  /**
   * @param {IPagoAporteRepository} pagoAporteRepository - Repositorio de pagos de aportes
   */
  constructor(pagoAporteRepository) {
    this.pagoAporteRepository = pagoAporteRepository;
  }

  /**
   * Ejecuta el caso de uso de obtener un pago por ID
   * 
   * @param {string|number} id - ID del pago
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
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
      // GET /v1/pagos-aportes/:id
      const result = await this.pagoAporteRepository.obtenerPorId(id);
      
      // Si hay error en el repositorio, retornarlo
      if (!result.success) {
        return result;
      }

      // Retornar datos directamente del backend
      // El backend retorna: { id, estudiante, gestion, metodoPago, beca, inscripcion, ... }
      // No hay lógica adicional de negocio en este caso
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener pago de aporte',
      };
    }
  }
}
