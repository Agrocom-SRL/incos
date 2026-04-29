/**
 * Use Case: obtener todos los docentes (listado con query estándar del API).
 */

import { IDocenteRepository } from '@repositories/IDocenteRepository';

export class ObtenerTodosDocentesUseCase {
  /**
   * @param {IDocenteRepository} docenteRepository
   */
  constructor(docenteRepository) {
    this.docenteRepository = docenteRepository;
  }

  /**
   * @param {Object} [options]
   * @param {Object} [options.params] - Query: page, limit, search, sort
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(options = {}) {
    try {
      const result = await this.docenteRepository.obtenerTodos(options);
      if (!result.success) {
        return result;
      }
      return {
        success: true,
        data: result.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener docentes',
      };
    }
  }
}
