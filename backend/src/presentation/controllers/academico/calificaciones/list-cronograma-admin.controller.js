export class ListCronogramaAdminController {
  constructor({ listCronogramaAdminUseCase, logger, responseFormatter }) {
    this.listCronogramaAdminUseCase = listCronogramaAdminUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const payload = await this.listCronogramaAdminUseCase.execute();
      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Cronograma (administración) obtenido correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Institucional] Error GET cronograma admin', { error: error.message });
      return next(error);
    }
  }
}
