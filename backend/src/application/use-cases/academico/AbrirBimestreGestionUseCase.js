import { UnprocessableEntityError } from '../../../domain/errors/AppError.js';

/**
 * Apertura institucional de un bimestre de la gestión vigente.
 * Transiciona bimestres_matricula PENDIENTE → EN_CURSO; el repositorio bloquea
 * si el bimestre del calendario aún es futuro (BIMESTRE_FUTURO).
 */
export class AbrirBimestreGestionUseCase {
  constructor({ gestionBimestresRepository, logger }) {
    this.gestionBimestresRepository = gestionBimestresRepository;
    this.logger = logger;
  }

  async execute({ numeroBimestre, userId }) {
    try {
      const result = await this.gestionBimestresRepository.abrirBimestreGestion(
        numeroBimestre,
        userId,
      );
      this.logger.info('[Calificaciones] Bimestre abierto', {
        numeroBimestre,
        abiertos: result?.data?.abiertos,
      });
      return result;
    } catch (error) {
      if (error.code === 'BIMESTRE_FUTURO') {
        const err = new UnprocessableEntityError(error.message);
        err.code = 'BIMESTRE_FUTURO';
        throw err;
      }
      throw error;
    }
  }
}
