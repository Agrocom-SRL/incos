import { IParaleloRepository } from '@domain/repositories';

export class ActualizarParaleloUseCase {
  constructor(paraleloRepository) {
    this.paraleloRepository = paraleloRepository;
  }

  async ejecutar(id, datos) {
    try {
      if (!id) {
        return { success: false, error: 'El ID del paralelo es requerido' };
      }
      const result = await this.paraleloRepository.actualizar(id, datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al actualizar paralelo'
            : result.error || 'Error al actualizar paralelo';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error?.message || 'Error inesperado al actualizar paralelo' };
    }
  }
}
