import { ITipoEvaluacionAdminRepository } from '@domain/repositories';

export class GetTipoEvaluacionPorIdUseCase {
  /**
   * @param {ITipoEvaluacionAdminRepository} tipoEvaluacionRepository
   */
  constructor(tipoEvaluacionRepository) {
    this.tipoEvaluacionRepository = tipoEvaluacionRepository;
  }

  async ejecutar(id) {
    try {
      if (!id) {
        return { success: false, error: 'El ID del tipo de evaluación es requerido' };
      }
      return await this.tipoEvaluacionRepository.obtenerPorId(id);
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al obtener el tipo de evaluación',
      };
    }
  }
}
