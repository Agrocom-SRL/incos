import { IDocenteRepository } from '@repositories/IDocenteRepository';

export class CrearDocenteUseCase {
  /**
   * @param {IDocenteRepository} docenteRepository
   */
  constructor(docenteRepository) {
    this.docenteRepository = docenteRepository;
  }

  async ejecutar(datosDocente) {
    try {
      if (!datosDocente || typeof datosDocente !== 'object') {
        return { success: false, error: 'Los datos del docente son requeridos' };
      }

      const result = await this.docenteRepository.crear(datosDocente);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al crear docente'
            : result.error || 'Error al crear docente';
        return { success: false, error: errorMessage };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al crear docente',
      };
    }
  }
}

