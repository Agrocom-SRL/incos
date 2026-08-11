/**
 * GET /api/v1/pasantias/:id/seguimientos/:seguimientoId/pdf (extensión 2026-08-11)
 * Descarga autenticada de la hoja de seguimiento — se regenera en el momento
 * (buffer en memoria, no un archivo de disco). Permiso: titulacion.pasantia
 * EXPORTAR.
 */
export class ExportSeguimientoPasantiaPdfController {
  constructor({ exportSeguimientoPasantiaPdfUseCase, logger }) {
    if (!exportSeguimientoPasantiaPdfUseCase) {
      throw new Error('exportSeguimientoPasantiaPdfUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportSeguimientoPasantiaPdfUseCase = exportSeguimientoPasantiaPdfUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const pasantiaId = parseInt(req.params.id, 10);
      const seguimientoId = parseInt(req.params.seguimientoId, 10);
      this.logger.info('[Pasantías] Request de descarga de seguimiento', {
        pasantiaId,
        seguimientoId,
      });

      const { buffer, fileName, mimeType } = await this.exportSeguimientoPasantiaPdfUseCase.execute(
        {
          pasantiaId,
          seguimientoId,
        }
      );

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Pasantías] Error al descargar seguimiento', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
