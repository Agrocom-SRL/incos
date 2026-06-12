import { NotFoundError } from '../../../domain/errors/AppError.js';
import { activarCursadoInscripcion } from '../../utils/activarCursadoInscripcion.js';

/**
 * Use Case: CambiarEstadoMatriculaUseCase
 * Módulo: Inscripciones
 *
 * Activa el cursado de una inscripción concreta: pasa TODAS sus matrículas de
 * materia de INSCRITO → CURSANDO y abre sus 4 bimestres. Útil para inscripciones
 * tardías cuando la gestión ya arrancó (la activación masiva por gestión vive en
 * `IniciarGestionAcademicaUseCase`).
 *
 * Orquesta la operación multi-tabla (matriculas_materia + bimestres_matricula)
 * en una transacción vía `activarCursadoInscripcion`; cada repositorio escribe
 * una sola tabla. Idempotente: reejecutar devuelve `matriculasInscritoACursando = 0`.
 */
export class CambiarEstadoMatriculaUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.enrollmentRepository - Repositorio de inscripciones
   * @param {Object} params.subjectEnrollmentRepository - Repositorio de matriculas_materia
   * @param {Object} params.subjectEnrollmentBimesterRepository - Repositorio de bimestres_matricula
   * @param {ILogger} params.logger
   */
  constructor({
    enrollmentRepository,
    subjectEnrollmentRepository,
    subjectEnrollmentBimesterRepository,
    logger,
  }) {
    this.enrollmentRepository = enrollmentRepository;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.subjectEnrollmentBimesterRepository = subjectEnrollmentBimesterRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} input
   * @param {number} input.inscripcionId
   * @param {number|null} input.userId
   * @returns {Promise<{inscripcionId:number, matriculasInscritoACursando:number}>}
   */
  async execute({ inscripcionId, userId = null }) {
    const enrollment = await this.enrollmentRepository.findById(inscripcionId);
    if (!enrollment) {
      throw new NotFoundError(`Inscripción con ID ${inscripcionId}`);
    }

    const result = await activarCursadoInscripcion({
      subjectEnrollmentRepository: this.subjectEnrollmentRepository,
      subjectEnrollmentBimesterRepository: this.subjectEnrollmentBimesterRepository,
      inscripcionId,
      userId,
    });

    this.logger.info('[Inscripciones] Cursado activado por inscripción', {
      inscripcionId,
      ...result,
    });

    return { inscripcionId, ...result };
  }
}
