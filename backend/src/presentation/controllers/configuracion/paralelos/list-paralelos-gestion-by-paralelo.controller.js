import { NotFoundError } from '../../../../domain/errors/AppError.js';

export class ListParalelosGestionByParaleloController {
  constructor({ listParalelosGestionByParaleloUseCase, logger, responseFormatter }) {
    this.useCase = listParalelosGestionByParaleloUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      this.logger.info('Request de instancias gestión por paralelo maestro', { id });
      const result = await this.useCase.execute(id);
      return this.responseFormatter.retrieved(
        res,
        result,
        'paralelo',
        id,
        req,
      );
    } catch (error) {
      this.logger.error('Error al listar paralelos en gestión', {
        error: error.message,
        id: req.params?.id,
      });
      return next(error instanceof NotFoundError ? error : error);
    }
  }
}
