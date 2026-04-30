import { IParaleloRepository } from '@repositories/IParaleloRepository';

export class GetCapacidadTurnoUseCase {
  constructor(paraleloRepository) {
    this.paraleloRepository = paraleloRepository;
  }

  async ejecutar(options = {}) {
    const { params = {} } = options;
    try {
      const result = await this.paraleloRepository.obtenerCapacidadTurnoDashboard({ params });
      if (!result.success) return result;
      return { success: true, data: result.data || [] };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener capacidad por turno',
      };
    }
  }
}
