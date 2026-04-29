import { IDocenteRepository } from '@repositories/IDocenteRepository';

export class ActualizarDocenteUseCase {
  /**
   * @param {IDocenteRepository} docenteRepository
   */
  constructor(docenteRepository) {
    this.docenteRepository = docenteRepository;
  }

  async ejecutar(docenteId, datosDocente) {
    try {
      if (!docenteId) {
        return { success: false, error: 'El ID del docente es requerido' };
      }
      if (!datosDocente || typeof datosDocente !== 'object') {
        return { success: false, error: 'Los datos del docente son requeridos' };
      }

      const result = await this.docenteRepository.actualizar(docenteId, datosDocente);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al actualizar docente'
            : result.error || 'Error al actualizar docente';
        return { success: false, error: errorMessage };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al actualizar docente',
      };
    }
  }
}

