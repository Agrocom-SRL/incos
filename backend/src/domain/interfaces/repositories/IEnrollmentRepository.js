import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEnrollmentRepository
 * Define el contrato que debe cumplir el repositorio de inscripciones
 * 
 * Métodos heredados de IRepository:
 * - findById(id)
 * - findBy(criteria, options)
 * - findAll(filters, page, limit)
 * - create(data, userId)
 * - update(id, data, userId)
 * - delete(id, userId)
 * - search(searchTerm, options)
 * - count(filters)
 * 
 * Métodos específicos:
 * - obtenerInscripcionActual(filters) - Obtiene inscripción actual con materias desde vista_estudiante_inscripcion_actual
 */
export class IEnrollmentRepository extends IRepository {
  /**
   * Obtiene inscripción actual del estudiante por gestión desde vista_estudiante_inscripcion_actual.
   * Retorna una fila por materia inscrita con información completa (materia, paralelo, periodo, carrera).
   *
   * @param {Object} filters - Filtros opcionales
   *   - estudiante_id: ID del estudiante
   *   - codigo_estudiante: Código único del estudiante
   *   - gestion_id: ID de la gestión académica
   *   - inscripcion_id: ID de la inscripción
   * @returns {Promise<Array>} Array de objetos planos (una fila por materia inscrita)
   *   Campos según vista_estudiante_inscripcion_actual: estudiante_id, codigo_estudiante, ci, expedicion,
   *   inscripcion_id, gestion_id, tipo_inscripcion, fecha_inscripcion, gestion_nombre, gestion_anio,
   *   inscripcion_materia_id, curso_id, docente_id, materia_estado, materia_observaciones,
   *   curso_codigo, paralelo_id, paralelo_nombre, paralelo_turno, carrera_id, carrera_nombre, carrera_codigo,
   *   periodo_id, periodo_numero, periodo_nombre, materia_id, materia_sigla, materia_nombre, materia_tipo,
   *   horas_semanales, creditos, materia_modalidad, materia_orden, etc.
   */
  async obtenerInscripcionActual(filters = {}) {
    throw new Error('Method obtenerInscripcionActual must be implemented by subclass');
  }
}
