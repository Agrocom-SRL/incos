export class SaveAjustesCursoUseCase {
  constructor({ ajustesCursoRepository, logger }) {
    this.ajustesCursoRepository = ajustesCursoRepository;
    this.logger = logger;
  }

  async execute({ asignacionId, body, userId }) {
    const data = await this.ajustesCursoRepository.guardarAjustes(asignacionId, body, userId);
    if (!data) {
      const err = new Error('Asignación no encontrada');
      err.statusCode = 404;
      throw err;
    }
    this.logger.info('[Calificaciones] Ajustes curso guardados', { asignacionId, userId });
    return data;
  }
}
