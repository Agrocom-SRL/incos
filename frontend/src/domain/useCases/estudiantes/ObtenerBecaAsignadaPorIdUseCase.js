/**
 * Use Case: Obtener detalle de una asignación de beca por ID (listado global).
 * GET /v1/estudiantes/becas/:id
 */

import { IEstudianteBecaRepository } from '@domain/repositories';

export class ObtenerBecaAsignadaPorIdUseCase {
  /**
   * @param {IEstudianteBecaRepository} estudianteBecaRepository
   */
  constructor(estudianteBecaRepository) {
    this.estudianteBecaRepository = estudianteBecaRepository;
  }

  /**
   * @param {string|number} becaAsignacionId - ID en estudiantes_becas
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async ejecutar(becaAsignacionId) {
    try {
      const result = await this.estudianteBecaRepository.obtenerDetalleAsignacionPorId(becaAsignacionId);
      if (!result.success) {
        return result;
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener la asignación de beca',
      };
    }
  }
}
