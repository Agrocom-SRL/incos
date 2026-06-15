import { UnprocessableEntityError } from '../../../domain/errors/AppError.js';

/**
 * Cierre institucional de un bimestre.
 */
export class CerrarBimestreGestionUseCase {
  constructor({ gestionBimestresRepository, logger }) {
    this.gestionBimestresRepository = gestionBimestresRepository;
    this.logger = logger;
  }

  async execute({ numeroBimestre, userId }) {
    try {
      const result = await this.gestionBimestresRepository.cerrarBimestreGestion(
        numeroBimestre,
        userId,
      );
      if (result?.preparacion) {
        this.logger.info('[Calificaciones] Cierre en preparación', { numeroBimestre });
      } else {
        this.logger.info('[Calificaciones] Bimestre cerrado', { numeroBimestre, ...result });
      }
      return result;
    } catch (error) {
      if (error.code === 'CIERRE_BLOQUEADO') {
        const err = new UnprocessableEntityError(error.message);
        err.code = 'CIERRE_BLOQUEADO';
        err.validacion = error.validacion;
        throw err;
      }
      throw error;
    }
  }
}
