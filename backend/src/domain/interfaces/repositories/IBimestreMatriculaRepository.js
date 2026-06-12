import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IBimestreMatriculaRepository
 *
 * Convención de capas:
 * IBimestreMatriculaRepository → models/bimestre_matricula.js (`bimestres_matricula`)
 * → SubjectEnrollmentBimester / SubjectEnrollmentBimesterMapper / SubjectEnrollmentBimesterRepository
 *
 * DDL: database/01-schemas/13-evaluaciones.sql
 *
 * Operaciones de negocio set-based sobre bimestres_matricula (apertura de
 * bimestres faltantes), consumidas por los casos de uso de inicio de gestión /
 * activación de cursado. Idempotentes.
 */
export class IBimestreMatriculaRepository extends IRepository {
    /** Abre los 4 bimestres faltantes de cada matrícula CURSANDO de una gestión. @returns {Promise<void>} */
    async abrirBimestresFaltantesPorGestion(gestionId, userId, options) {
        throw new Error('Method abrirBimestresFaltantesPorGestion() must be implemented');
    }

    /** Abre los 4 bimestres faltantes de cada matrícula CURSANDO de una inscripción. @returns {Promise<void>} */
    async abrirBimestresFaltantesPorInscripcion(inscripcionId, userId, options) {
        throw new Error('Method abrirBimestresFaltantesPorInscripcion() must be implemented');
    }

    // Operaciones puntuales usadas por el cuaderno (capa application orquesta).

    /** @returns {Promise<number|null>} */
    async obtenerBimestreMatriculaId(asignacionId, estudianteId, bimestreNum) {
        throw new Error('Method obtenerBimestreMatriculaId() must be implemented');
    }

    /** @returns {Promise<number|null>} */
    async asegurarBimestreMatriculaId(asignacionId, estudianteId, bimestreNum, usuarioId, options) {
        throw new Error('Method asegurarBimestreMatriculaId() must be implemented');
    }

    /** @returns {Promise<void>} */
    async asegurarBimestresMatriculaCurso(asignacionId, bimestreVigenteNum, usuarioId, options) {
        throw new Error('Method asegurarBimestresMatriculaCurso() must be implemented');
    }

    /** @returns {Promise<number[]>} */
    async listarBimestresMatriculaIdsCurso(asignacionId, bimestreNumero) {
        throw new Error('Method listarBimestresMatriculaIdsCurso() must be implemented');
    }

    /** @returns {Promise<void>} */
    async actualizarComponentesBimestreMatricula(bimestreMatriculaId, componentes, usuarioId, options) {
        throw new Error('Method actualizarComponentesBimestreMatricula() must be implemented');
    }

    /** @returns {Promise<Object|null>} */
    async obtenerBimestreMatriculaPorId(bimestreMatriculaId) {
        throw new Error('Method obtenerBimestreMatriculaPorId() must be implemented');
    }

    /** @returns {Promise<void>} */
    async actualizarHabilitacionBimestreMatricula(bimestreMatriculaId, datos, usuarioId, options) {
        throw new Error('Method actualizarHabilitacionBimestreMatricula() must be implemented');
    }
}
