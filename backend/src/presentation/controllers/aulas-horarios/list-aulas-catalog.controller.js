export class ListAulasCatalogController {
  constructor({ listAulasCatalogUseCase, responseFormatter }) {
    this.useCase = listAulasCatalogUseCase;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const result = await this.useCase.execute();
      return this.responseFormatter._success(res, result, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}
