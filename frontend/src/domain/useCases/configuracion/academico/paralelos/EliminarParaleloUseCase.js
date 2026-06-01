import { IParaleloRepository } from '@domain/repositories';

export class EliminarParaleloUseCase {
  constructor(paraleloRepository) {
    this.paraleloRepository = paraleloRepository;
  }

  async ejecutar(paraleloId) {
    try {
      if (!paraleloId) {
        return { success: false, error: 'El ID del paralelo es requerido' };
      }
      const result = await this.paraleloRepository.eliminar(paraleloId);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al eliminar paralelo'
            : result.error || 'Error al eliminar paralelo';
        return { success: false, error: errorMessage };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.message || 'Error inesperado al eliminar paralelo' };
    }
  }
}
