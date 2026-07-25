/**
 * GET /api/v1/proyectos-grado/:id/dictamenes/:dictamenId/archivo (T23)
 * Descarga autenticada del PDF del dictamen (res.download).
 * Permiso: tutorias.titulacion.proyecto EXPORTAR.
 */
export class ExportDictamenPdfController {
  constructor({ exportDictamenPdfUseCase, logger }) {
    if (!exportDictamenPdfUseCase) {
      throw new Error('exportDictamenPdfUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportDictamenPdfUseCase = exportDictamenPdfUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const proyectoGradoId = parseInt(req.params.id, 10);
      const dictamenId = parseInt(req.params.dictamenId, 10);
      this.logger.info('[Tutorías] Request de descarga de dictamen', {
        proyectoGradoId,
        dictamenId,
      });

      const { absolutePath, fileName } = await this.exportDictamenPdfUseCase.execute({
        proyectoGradoId,
        dictamenId,
      });

      return res.download(absolutePath, fileName);
    } catch (error) {
      this.logger.error('[Tutorías] Error al descargar dictamen', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
