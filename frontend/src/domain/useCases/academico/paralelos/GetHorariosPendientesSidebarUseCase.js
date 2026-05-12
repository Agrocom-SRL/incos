import { IParaleloRepository } from '@repositories/IParaleloRepository';

export class GetHorariosPendientesSidebarUseCase {
  constructor(paraleloRepository) {
    /** @type {IParaleloRepository} */
    this.paraleloRepository = paraleloRepository;
  }

  async ejecutar(options = {}) {
    const { params = {} } = options;
    try {
      const result = await this.paraleloRepository.obtenerHorariosPendientesSidebar({ params });
      if (!result.success) return result;
      return { success: true, data: result.data || null };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener pendientes de horarios',
      };
    }
  }
}
