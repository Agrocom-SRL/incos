import { IParaleloRepository } from '@domain/repositories';

export class CrearParaleloUseCase {
  constructor(paraleloRepository) {
    this.paraleloRepository = paraleloRepository;
  }

  async ejecutar(datos) {
    try {
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos del paralelo son requeridos' };
      }
      const result = await this.paraleloRepository.crear(datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al crear paralelo'
            : result.error || 'Error al crear paralelo';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error?.message || 'Error inesperado al crear paralelo' };
    }
  }
}
