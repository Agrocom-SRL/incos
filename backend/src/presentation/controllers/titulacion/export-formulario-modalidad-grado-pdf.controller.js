/**
 * GET /api/v1/proyectos-grado/:id/formulario-modalidad/pdf
 * Requisito 1 — extensión 2026-07-31.
 * PDF del Formulario de Modalidad de Graduación (FMDG-1).
 * Permiso: titulacion.proyecto EXPORTAR. Respuesta binaria (PDF).
 */
export class ExportFormularioModalidadGradoPdfController {
  constructor({ exportFormularioModalidadGradoPdfUseCase, logger }) {
    if (!exportFormularioModalidadGradoPdfUseCase) {
      throw new Error('exportFormularioModalidadGradoPdfUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportFormularioModalidadGradoPdfUseCase = exportFormularioModalidadGradoPdfUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const proyectoGradoId = parseInt(req.params.id, 10);
      this.logger.info('[Titulación] Request exportación PDF formulario de modalidad de graduación', {
        proyectoGradoId,
      });

      const { buffer, fileName, mimeType } =
        await this.exportFormularioModalidadGradoPdfUseCase.execute(proyectoGradoId);

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Titulación] Error al exportar formulario de modalidad de graduación', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
