import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: ICursoCapacitacionRepository
 *
 * Cursos de capacitación (tabla raíz `capacitaciones`, módulo CAP) y su
 * junction de bloques horarios (`capacitacion_horarios` → catálogo `horarios`,
 * reutiliza los mismos bloques tipo_horario='CLASES' del sistema académico).
 * El aula vive en `capacitaciones.aula_id` (igual que `paralelos_gestion.aula_id`).
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository. La junction no tiene repositorio
 * propio: sus operaciones (leer/reemplazar bloques de UN curso) son parte del
 * agregado del curso y se exponen aquí.
 */
export class ICursoCapacitacionRepository extends IRepository {
  /**
   * IDs de bloques (`horarios.id`) vigentes del curso, en orden de secuencia.
   *
   * @param {number} capacitacionId
   * @returns {Promise<number[]>}
   */
  async findHorarioIdsByCapacitacionId(_capacitacionId) {
    throw new Error('Method findHorarioIdsByCapacitacionId() must be implemented');
  }

  /**
   * Reemplaza la junction de bloques horarios del curso: soft-delete de las
   * filas vigentes y alta de las nuevas con orden_secuencia 1..n.
   *
   * @param {number} capacitacionId
   * @param {number[]} horarioIds - IDs del catálogo `horarios` (puede ser [])
   * @param {number|null} userId - Usuario para auditoría
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<void>}
   */
  async replaceHorarios(_capacitacionId, _horarioIds, _userId = null, _options = {}) {
    throw new Error('Method replaceHorarios() must be implemented');
  }

  /**
   * Los bloques `horarios` (tipo_horario='CLASES') con flag `ocupado`
   * calculado para un aula (choque con paralelos académicos u otros cursos
   * de capacitación en esa misma aula).
   *
   * @param {Object} params
   * @param {number} params.aulaId
   * @param {number|null} [params.excludeCursoId]
   * @returns {Promise<Array<Object>>}
   */
  async listHorariosDisponibles(_params) {
    throw new Error('Method listHorariosDisponibles() must be implemented');
  }
}
