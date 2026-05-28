import { IMateriaRepository } from '@domain/repositories';

export class ActualizarMateriaUseCase {
  /**
   * @param {IMateriaRepository} materiaRepository
   */
  constructor(materiaRepository) {
    this.materiaRepository = materiaRepository;
  }

  async ejecutar(materiaId, datos) {
    try {
      if (!materiaId) {
        return { success: false, error: 'El ID de la materia es requerido' };
      }
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos de la materia son requeridos' };
      }
      const result = await this.materiaRepository.actualizar(materiaId, datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al actualizar materia'
            : result.error || 'Error al actualizar materia';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al actualizar materia',
      };
    }
  }
}
