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
 * database/01-schemas/12-inscripciones.sql
 *
 * NOTA:
 * Solo extiende IRepository sin métodos adicionales de dominio cruzado.
 * La especialización de consulta vive en SubjectEnrollmentRepository.buildWhereClause()
 * (p. ej. teacherAssignmentIds para filtros IN); la orquestación entre asignación docente
 * y matrícula de materia va en casos de uso de la capa application.
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