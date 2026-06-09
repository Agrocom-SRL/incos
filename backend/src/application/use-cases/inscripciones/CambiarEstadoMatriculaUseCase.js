import { NotFoundError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: CambiarEstadoMatriculaUseCase
 * Módulo: Inscripciones
 *
 * Activa el cursado de una inscripción concreta: pasa TODAS sus matrículas de
 * materia de INSCRITO → CURSANDO y abre sus 4 bimestres. Útil para inscripciones
 * tardías cuando la gestión ya arrancó (la activación masiva por gestión vive en
 * `IniciarGestionAcademicaUseCase`).
 *
 * Idempotente: reejecutar es seguro y devuelve `matriculasInscritoACursando = 0`.
 */
export class CambiarEstadoMatriculaUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.enrollmentRepository - Repositorio de inscripciones
   * @param {Object} params.gestionBimestresRepository - Repositorio de gestión de bimestres
   * @param {ILogger} params.logger
   */
  constructor({ enrollmentRepository, gestionBimestresRepository, logger }) {
    this.enrollmentRepository = enrollmentRepository;
    this.gestionBimestresRepository = gestionBimestresRepository;
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

    const result = await this.gestionBimestresRepository.activarCursadoPorInscripcion(
      inscripcionId,
      userId,
    );

    this.logger.info('[Inscripciones] Cursado activado por inscripción', {
      inscripcionId,
      ...result,
    });

    return { inscripcionId, ...result };
  }
}
