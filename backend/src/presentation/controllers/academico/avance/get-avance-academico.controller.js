/**
 * GET /api/v1/avance-academico[?carreraId=<entero>]
 * Avance académico por estudiante × plan (dataKey: `avance`). Si el usuario
 * autenticado tiene vínculo de ESTUDIANTE, el use case acota EN SERVIDOR a su
 * propia fila (anti-IDOR, "Mi avance").
 * Permiso: academico.avance · LISTAR.
 */
export class GetAvanceAcademicoController {
  constructor({ getAvanceAcademicoUseCase, logger, responseFormatter }) {
    this.getAvanceAcademicoUseCase = getAvanceAcademicoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const { carreraId } = req.query;
      const usuarioId = req.user?.id ?? null;

      this.logger.info('[Académico] Avance académico', { carreraId, usuarioId });

      const payload = await this.getAvanceAcademicoUseCase.execute({ carreraId, usuarioId });

      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Avance académico obtenido correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Académico] Error avance académico', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default GetAvanceAcademicoController;
