import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IMatriculaMateriaRepository
 * Define el contrato que debe cumplir el repositorio de matrículas de materia.
 *
 * Convención de capas:
 * IMatriculaMateriaRepository → models/matricula_materia.js (`matriculas_materia`)
 * → SubjectEnrollment / SubjectEnrollmentMapper / SubjectEnrollmentRepository
 *
 * DDL:
 * database/01-schemas/17-inscripciones-parte1.sql
 *
 * NOTA:
 * Solo extiende IRepository sin métodos adicionales.
 * La especialización está en la implementación concreta mediante buildWhereClause().
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
 */
export class IMatriculaMateriaRepository extends IRepository {
    // Solo hereda métodos de IRepository
}