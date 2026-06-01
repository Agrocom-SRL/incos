import { IParaleloRepository } from '@domain/repositories';
import { normalizeFieldToArray } from '@application/utils';

export class GetParaleloPorIdUseCase {
  constructor(paraleloRepository) {
    this.paraleloRepository = paraleloRepository;
  }

  async ejecutar(id) {
    try {
      if (!id) {
        return { success: false, error: 'El ID del paralelo es requerido' };
      }
      const result = await this.paraleloRepository.obtenerPorId(id);
      if (!result.success) {
        return { success: false, error: result.error || 'Error al obtener paralelo' };
      }
      const data = result.data ?? {};
      const list = normalizeFieldToArray(data, 'paralelo');
      const paralelo = Array.isArray(list) ? list[0] : data.paralelo ?? data;
      return { success: true, data: { paralelo } };
    } catch (error) {
      return { success: false, error: error?.message || 'Error inesperado al obtener paralelo' };
    }
  }
}
