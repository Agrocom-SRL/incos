import { IMateriaRepository } from '@domain/repositories';

export class CrearMateriaUseCase {
  /**
   * @param {IMateriaRepository} materiaRepository
   */
  constructor(materiaRepository) {
    this.materiaRepository = materiaRepository;
  }

  async ejecutar(datos) {
    try {
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos de la materia son requeridos' };
      }
      const result = await this.materiaRepository.crear(datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al crear materia'
            : result.error || 'Error al crear materia';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al crear materia',
      };
    }
  }
}
