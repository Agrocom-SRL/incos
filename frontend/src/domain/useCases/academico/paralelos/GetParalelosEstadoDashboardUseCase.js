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
      const raw = result.data;
      if (raw && typeof raw === 'object' && !Array.isArray(raw) && Array.isArray(raw.paralelos)) {
        return { success: true, data: raw };
      }
      if (Array.isArray(raw)) {
        return { success: true, data: { paralelos: raw, kpis: null } };
      }
      return { success: true, data: { paralelos: [], kpis: null } };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener estado de paralelos',
      };
    }
  }
}
