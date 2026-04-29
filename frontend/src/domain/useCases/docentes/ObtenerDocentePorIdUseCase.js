/**
 * Detalle de docente (ficha) desde el API.
 */

import { IDocenteRepository } from '@repositories/IDocenteRepository';

export class ObtenerDocentePorIdUseCase {
  /**
   * @param {IDocenteRepository} docenteRepository
   */
  constructor(docenteRepository) {
    this.docenteRepository = docenteRepository;
  }

  /**
   * @param {string|number} id
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async ejecutar(id) {
    try {
      const result = await this.docenteRepository.obtenerPorId(id);
      if (!result.success) {
        return result;
      }
      return { success: true, data: result.data || null };
    } catch (error) {
      return { success: false, error: error.message || 'Error al obtener el docente' };
    }
  }
}
