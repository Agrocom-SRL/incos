/**
 * Interfaz del Repositorio de Carreras
 * Define el contrato que deben cumplir las implementaciones
 * 
 * Interface Segregation Principle: Interfaz específica para carreras
 * Dependency Inversion Principle: Dependemos de abstracción, no de implementación
 * 
 * Clean Architecture:
 * - Domain Layer: Extiende IBaseRepository con métodos específicos de carreras
 */

import { IBaseRepository } from './IBaseRepository.js';

export class ICarreraRepository extends IBaseRepository {
  /**
   * Busca una carrera por código
   * Método específico de carreras (no está en la interfaz base)
   * @param {string} codigo - Código de la carrera
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async findByCodigo(codigo) {
    throw new Error('Method findByCodigo() must be implemented');
  }
}

