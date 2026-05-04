export class GetParaleloCursosOfertaUseCase {
  constructor(paraleloRepository) {
    this.paraleloRepository = paraleloRepository;
  }

  async ejecutar(parallelId) {
    try {
      if (!parallelId) {
        return { success: false, error: 'ID del paralelo es requerido' };
      }
      const result = await this.paraleloRepository.obtenerCursosOferta({ parallelId });
      if (!result.success) {
        return result;
      }
      return { success: true, data: result.data || null };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener la oferta de cursos del paralelo',
      };
    }
  }
}
