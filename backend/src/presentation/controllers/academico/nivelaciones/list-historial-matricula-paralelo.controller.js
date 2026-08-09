/**
 * GET /api/v1/nivelaciones?paraleloGestionId=<entero>
 */
export class ListHistorialMatriculaParaleloController {
  constructor({ listHistorialMatriculaParaleloUseCase, logger, responseFormatter }) {
    this.listHistorialMatriculaParaleloUseCase = listHistorialMatriculaParaleloUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const paraleloGestionId = parseInt(req.query.paraleloGestionId, 10);

      const payload = await this.listHistorialMatriculaParaleloUseCase.execute({
        paraleloGestionId,
      });

      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Historial de nivelaciones del paralelo obtenido correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Nivelaciones] Error listado por paralelo', { error: error.message });
      return next(error);
    }
  }
}

export default ListHistorialMatriculaParaleloController;
