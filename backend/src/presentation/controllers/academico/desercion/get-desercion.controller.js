/**
 * GET /api/v1/desercion[?gestionId=<entero>][&carreraId=<entero>]
 * Métrica institucional de deserción (grano ANUAL): agregado carrera × gestión
 * (dataKey `carreras`) + detalle de desertores (dataKey `desertores`) +
 * totales globales (`resumen`).
 * Permiso: academico.desercion · LISTAR.
 */
export class GetDesercionController {
  constructor({ getDesercionUseCase, logger, responseFormatter }) {
    this.getDesercionUseCase = getDesercionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const { gestionId, carreraId } = req.query;

      this.logger.info('[Académico] Deserción', { gestionId, carreraId });

      const payload = await this.getDesercionUseCase.execute({ gestionId, carreraId });

      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Deserción estudiantil obtenida correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Académico] Error deserción', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default GetDesercionController;
