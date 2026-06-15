/**
 * Tablero / gestión de bimestres — lectura del estado institucional.
 */
export class GetGestionBimestresUseCase {
  constructor({ gestionBimestresRepository, logger }) {
    this.gestionBimestresRepository = gestionBimestresRepository;
    this.logger = logger;
  }

  async execute() {
    const tablero = await this.gestionBimestresRepository.obtenerGestionBimestres();
    if (!tablero) {
      const err = new Error('No hay gestión académica vigente');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    this.logger.info('[Calificaciones] Gestión bimestres cargada', {
      gestionId: tablero.gestion?.id,
      bimestreVigente: tablero.bimestreVigente,
    });
    return tablero;
  }
}
