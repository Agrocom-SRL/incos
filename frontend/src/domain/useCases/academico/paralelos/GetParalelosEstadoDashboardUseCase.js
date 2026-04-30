import { IParaleloRepository } from '@repositories/IParaleloRepository';

export class GetParalelosEstadoDashboardUseCase {
  constructor(paraleloRepository) {
    this.paraleloRepository = paraleloRepository;
  }

  async ejecutar(options = {}) {
    const { params = {} } = options;
    try {
      const result = await this.paraleloRepository.obtenerParalelosEstadoDashboard({ params });
      if (!result.success) return result;
      return { success: true, data: result.data || [] };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener estado de paralelos',
      };
    }
  }
}
