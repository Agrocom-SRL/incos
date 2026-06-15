export class GetCronogramaGestionController {
  constructor({ getCronogramaGestionUseCase, logger, responseFormatter }) {
    this.getCronogramaGestionUseCase = getCronogramaGestionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const payload = await this.getCronogramaGestionUseCase.execute();
      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Cronograma de la gestión obtenido correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Institucional] Error GET cronograma gestión', {
        error: error.message,
      });
      return next(error);
    }
  }
}
