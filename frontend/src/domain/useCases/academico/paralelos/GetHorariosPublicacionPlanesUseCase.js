import { IParaleloRepository } from '@repositories/IParaleloRepository';

export class GetHorariosPublicacionPlanesUseCase {
  constructor(paraleloRepository) {
    /** @type {IParaleloRepository} */
    this.paraleloRepository = paraleloRepository;
  }

  async ejecutar(options = {}) {
    const { params = {} } = options;
    try {
      const result = await this.paraleloRepository.obtenerHorariosPublicacionPlanes({ params });
      if (!result.success) return result;
      return { success: true, data: result.data || null };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener planes de publicación',
      };
    }
  }
}
