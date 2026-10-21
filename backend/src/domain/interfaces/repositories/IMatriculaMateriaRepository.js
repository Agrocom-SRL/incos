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
 * - findById · findBy · findAll · create · update · delete · search · count
 *
 * Operaciones de negocio set-based sobre matriculas_materia (consumidas por los
 * casos de uso de inicio de gestión / activación de cursado).
 */
export class IMatriculaMateriaRepository extends IRepository {
    /** ¿Existe matrícula en cursado/cerrado en la gestión? @returns {Promise<boolean>} */
    async existeCursandoEnGestion(gestionId) {
        throw new Error('Method existeCursandoEnGestion() must be implemented');
    }

    /** Cuenta matrículas en estado CURSANDO de una gestión. @returns {Promise<number>} */
    async contarCursandoEnGestion(gestionId) {
        throw new Error('Method contarCursandoEnGestion() must be implemented');
    }

    /** Transiciona INSCRITO → CURSANDO por gestión. @returns {Promise<number>} filas afectadas */
    async marcarCursandoPorGestion(gestionId, userId, options) {
        throw new Error('Method marcarCursandoPorGestion() must be implemented');
    }

    /** Transiciona INSCRITO → CURSANDO por inscripción. @returns {Promise<number>} filas afectadas */
    async marcarCursandoPorInscripcion(inscripcionId, userId, options) {
        throw new Error('Method marcarCursandoPorInscripcion() must be implemented');
    }

    /** Actualiza la nota final de una matrícula de materia (cierre de cuaderno). @returns {Promise<void>} */
    async actualizarNotaFinalMatricula(matriculaMateriaId, notaFinal, usuarioId, options) {
        throw new Error('Method actualizarNotaFinalMatricula() must be implemented');
    }
}
