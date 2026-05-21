import { ConflictError } from '../../../domain/errors/AppError.js';

/**
 * Inicia la gestión: INSCRITO → CURSANDO y habilita bimestre 1.
 */
export class IniciarGestionAcademicaUseCase {
  constructor({ gestionBimestresRepository, logger }) {
    this.gestionBimestresRepository = gestionBimestresRepository;
    this.logger = logger;
  }

  async execute({ userId }) {
    try {
      const result = await this.gestionBimestresRepository.iniciarGestionAcademica(userId);
      this.logger.info('[Calificaciones] Gestión académica iniciada', result);
      return result;
    } catch (error) {
      if (error.code === 'GESTION_YA_INICIADA') {
        const err = new ConflictError(error.message);
        err.code = 'GESTION_YA_INICIADA';
        throw err;
      }
      throw error;
    }
  }
}
