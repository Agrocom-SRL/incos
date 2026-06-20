export class CerrarBimestreCursoController {
  constructor({ cerrarBimestreCursoUseCase, logger, responseFormatter }) {
    this.cerrarBimestreCursoUseCase = cerrarBimestreCursoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.cerrarBimestreCursoUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId: req.params.asignacionId,
        bimestreNum: req.params.bimestre,
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Bimestre cerrado y consolidado' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error POST cerrar bimestre', {
        error: error.message,
      });
      return next(error);
    }
  }
}
