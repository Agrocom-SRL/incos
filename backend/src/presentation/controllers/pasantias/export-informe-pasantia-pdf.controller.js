/**
 * GET /api/v1/pasantias/:id/informes/:informeId/pdf (P14)
 * Descarga autenticada del PDF del informe — se regenera en el momento
 * (buffer en memoria, no un archivo de disco). Permiso: titulacion.pasantia
 * EXPORTAR.
 */
export class ExportInformePasantiaPdfController {
  constructor({ exportInformePasantiaPdfUseCase, logger }) {
    if (!exportInformePasantiaPdfUseCase) {
      throw new Error('exportInformePasantiaPdfUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportInformePasantiaPdfUseCase = exportInformePasantiaPdfUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const pasantiaId = parseInt(req.params.id, 10);
      const informeId = parseInt(req.params.informeId, 10);
      this.logger.info('[Pasantías] Request de descarga de informe', {
        pasantiaId,
        informeId,
      });

      const { buffer, fileName, mimeType } = await this.exportInformePasantiaPdfUseCase.execute({
        pasantiaId,
        informeId,
      });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Pasantías] Error al descargar informe', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
