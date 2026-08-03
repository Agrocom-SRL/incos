/**
 * POST /api/v1/libros/gestiones/:gestionId/folios — genera los folios de
 * TODOS los paralelos de la gestión, en el orden canónico de carrera
 * (dataFieldName: `resumenGeneracion`).
 */
export class GenerarFoliosGestionController {
  constructor({ generarFoliosGestionUseCase, logger, responseFormatter }) {
    this.generarFoliosGestionUseCase = generarFoliosGestionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.generarFoliosGestionUseCase.execute({
        usuarioId: req.user?.id ?? null,
        gestionId: Number(req.params.gestionId),
        body: req.body,
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { statusCode: 201, message: 'Folios de la gestión generados' },
        req,
      );
    } catch (error) {
      this.logger.error('[Libros] Error POST generar folios de gestión', {
        error: error.message,
      });
      return next(error);
    }
  }
}

export default GenerarFoliosGestionController;
