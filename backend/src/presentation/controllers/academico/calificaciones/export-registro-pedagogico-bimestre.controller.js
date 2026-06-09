/**
 * GET /api/v1/calificaciones/asignaciones/:asignacionId/bimestre/:bimestre/export/registro-pedagogico
 * Descarga Excel Registro Pedagógico Bimestral (bimestre cerrado).
 */
export class ExportRegistroPedagogicoBimestreController {
  constructor({ exportRegistroPedagogicoBimestreUseCase, logger }) {
    if (!exportRegistroPedagogicoBimestreUseCase) {
      throw new Error('exportRegistroPedagogicoBimestreUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportRegistroPedagogicoBimestreUseCase = exportRegistroPedagogicoBimestreUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      this.logger.info('[Calificaciones] Export registro pedagógico', {
        asignacionId: req.params?.asignacionId,
        bimestre: req.params?.bimestre,
      });

      const { buffer, fileName, mimeType } =
        await this.exportRegistroPedagogicoBimestreUseCase.execute({
          usuarioId: req.usuario.id,
          asignacionId: req.params.asignacionId,
          bimestre: req.params.bimestre,
        });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Calificaciones] Error export registro pedagógico', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
