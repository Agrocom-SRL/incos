/**
 * GET /api/v1/acompanamiento/panel/exportar?gestionId= (A11)
 * PDF del panel de acompañamiento (vistas 157/158/162). Respuesta binaria.
 * Permiso: tutorias.acompanamiento.panel EXPORTAR.
 */
export class ExportPanelAcompanamientoController {
  constructor({ exportPanelAcompanamientoPdfUseCase, logger }) {
    if (!exportPanelAcompanamientoPdfUseCase) {
      throw new Error('exportPanelAcompanamientoPdfUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportPanelAcompanamientoPdfUseCase = exportPanelAcompanamientoPdfUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      this.logger.info('[Tutorías] Request de exportación PDF del panel', {
        gestionId: req.query?.gestionId,
      });

      const { buffer, fileName, mimeType } =
        await this.exportPanelAcompanamientoPdfUseCase.execute(req.query || {});

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Tutorías] Error al exportar panel de acompañamiento', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
