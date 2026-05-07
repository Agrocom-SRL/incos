/**
 * Use Case: Persistir Horarios (Plan semanal) de Paralelo
 *
 * Envía el plan semanal editado (bloques por curso) al backend.
 * PUT /v1/paralelos/:id/schedule
 */
import { IParaleloRepository } from '@repositories/IParaleloRepository';

export class PutParaleloHorariosUseCase {
  /**
   * @param {IParaleloRepository} paraleloRepository
   */
  constructor(paraleloRepository) {
    this.paraleloRepository = paraleloRepository;
  }

  /**
   * @param {number} parallelId
   * @param {Array} schedules - courseSchedules
   */
  async ejecutar(parallelId, schedules) {
    try {
      if (!parallelId) {
        return { success: false, error: 'ID del paralelo es requerido' };
      }
      if (!Array.isArray(schedules)) {
        return { success: false, error: 'El plan (schedules) debe ser un array' };
      }

      const result = await this.paraleloRepository.persistirHorarios({ parallelId, schedules });
      if (!result.success) return result;

      return { success: true, data: result.data || null };
    } catch (error) {
      return { success: false, error: error.message || 'Error al guardar horarios del paralelo' };
    }
  }
}

