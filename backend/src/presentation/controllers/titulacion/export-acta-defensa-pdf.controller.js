/**
 * GET /api/v1/proyectos-grado/:id/acta-defensa/:actaId/pdf
 * PDF del acta de defensa (espejo §1 del plan de desarrollo).
 * Permiso: titulacion.proyecto EXPORTAR. Respuesta binaria (PDF).
 */
export class ExportActaDefensaPdfController {
  constructor({ exportActaDefensaPdfUseCase, logger }) {
    if (!exportActaDefensaPdfUseCase) {
      throw new Error('exportActaDefensaPdfUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportActaDefensaPdfUseCase = exportActaDefensaPdfUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const proyectoGradoId = parseInt(req.params.id, 10);
      const actaId = parseInt(req.params.actaId, 10);
      this.logger.info('[Titulación] Request exportación PDF acta de defensa', {
        proyectoGradoId,
        actaId,
      });

      const { buffer, fileName, mimeType } = await this.exportActaDefensaPdfUseCase.execute(
        proyectoGradoId,
        actaId
      );

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Titulación] Error al exportar PDF de acta de defensa', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
        actaId: req.params?.actaId,
      });
      return next(error);
    }
  }
}
