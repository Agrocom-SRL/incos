import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IBimestreMatriculaRepository
 *
 * Convención de capas:
 * IBimestreMatriculaRepository → models/bimestre_matricula.js (`bimestres_matricula`)
 * → SubjectEnrollmentBimester / SubjectEnrollmentBimesterMapper / SubjectEnrollmentBimesterRepository
 *
 * DDL: database/01-schemas/13-evaluaciones.sql
 */
export class IBimestreMatriculaRepository extends IRepository {}
