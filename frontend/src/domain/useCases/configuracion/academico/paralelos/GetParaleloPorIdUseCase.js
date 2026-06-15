import { IParaleloRepository } from '@domain/repositories';
import { normalizeFieldToArray } from '@application/utils';
import { paraleloListMapper } from '@application-academico/paralelos/mappers/paraleloListMapper';

/**
 * Desenvuelve respuestas legacy con doble anidamiento `{ paralelo: { paralelo } }`.
 */
export const unwrapParaleloFromApiData = (data) => {
  if (!data || typeof data !== 'object') return null;

  let raw = data.paralelo ?? data;
  if (
    raw &&
    typeof raw === 'object' &&
    raw.paralelo &&
    typeof raw.paralelo === 'object' &&
    raw.id == null &&
    raw.carreraId == null &&
    raw.carrera_id == null
  ) {
    raw = raw.paralelo;
  }

  return paraleloListMapper(raw) ?? raw;
};

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
      const raw = Array.isArray(list) && list.length ? list[0] : data.paralelo ?? data;
      const paralelo = unwrapParaleloFromApiData({ paralelo: raw });
      if (!paralelo) {
        return { success: false, error: 'Paralelo no encontrado' };
      }
      return { success: true, data: { paralelo } };
    } catch (error) {
      return { success: false, error: error?.message || 'Error inesperado al obtener paralelo' };
    }
  }
}
