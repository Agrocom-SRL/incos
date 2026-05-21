export class GetAjustesCursoUseCase {
  constructor({ ajustesCursoRepository, logger }) {
    this.ajustesCursoRepository = ajustesCursoRepository;
    this.logger = logger;
  }

  async execute({ asignacionId }) {
    const data = await this.ajustesCursoRepository.obtenerAjustes(asignacionId);
    if (!data) {
      const err = new Error('Asignación no encontrada');
      err.statusCode = 404;
      throw err;
    }
    this.logger.info('[Calificaciones] Ajustes curso obtenidos', { asignacionId });
    return data;
  }
}
