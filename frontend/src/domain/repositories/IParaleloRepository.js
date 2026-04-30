/**
 * Interfaz del Repositorio de Paralelos
 * Tabla: paralelos
 * 
 * Extiende IBaseRepository con métodos específicos de paralelos
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 * 
 * Ubicación: domain/repositories
 * - Parte del módulo Académico
 * - Feature: Paralelos
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IParaleloRepository extends IBaseRepository {

  /**
   * Obtiene los horarios completos de un paralelo
   * @param {Object} options - Opciones de consulta
   * @param {number} options.parallelId - ID del paralelo
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerHorarios(options = {}) {
    throw new Error('Method obtenerHorarios() must be implemented');
  }

  async obtenerParalelosEstadoDashboard(options = {}) {
    throw new Error('Method obtenerParalelosEstadoDashboard() must be implemented');
  }

  async obtenerAsignaturasSinCursoDashboard(options = {}) {
    throw new Error('Method obtenerAsignaturasSinCursoDashboard() must be implemented');
  }

  async obtenerCapacidadTurnoDashboard(options = {}) {
    throw new Error('Method obtenerCapacidadTurnoDashboard() must be implemented');
  }
}
