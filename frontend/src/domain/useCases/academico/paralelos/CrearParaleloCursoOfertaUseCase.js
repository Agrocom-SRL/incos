/**
 * POST /v1/paralelos/:id/cursos — alta de curso en la oferta del paralelo.
 */
import { IParaleloRepository } from '@repositories/IParaleloRepository';

export class CrearParaleloCursoOfertaUseCase {
  /**
   * @param {IParaleloRepository} paraleloRepository
   */
  constructor(paraleloRepository) {
    this.paraleloRepository = paraleloRepository;
  }

  /**
   * @param {number} parallelId
   * @param {Object} payload — asignaturaPlanId, cupoMinimo?, cupoMaximo?, colorHex?, codigo?
   */
  async ejecutar(parallelId, payload) {
    try {
      if (!parallelId) {
        return { success: false, error: 'ID del paralelo es requerido' };
      }
      if (!payload || payload.asignaturaPlanId == null) {
        return { success: false, error: 'asignaturaPlanId es requerido' };
      }

      const result = await this.paraleloRepository.crearCursoOferta({ parallelId, payload });
      if (!result.success) return result;

      return { success: true, data: result.data || null };
    } catch (error) {
      return { success: false, error: error.message || 'Error al crear el curso del paralelo' };
    }
  }
}
