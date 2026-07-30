/**
 * GET /api/v1/supervision-docente/:id/pdf (S6)
 * Descarga binaria del PDF de la «FICHA DE SEGUIMIENTO EN LA CLASE
 * PRESENCIAL» (réplica del formulario físico).
 * Permiso: docentes.supervision.ficha EXPORTAR.
 * Nombre: ficha-seguimiento-{apellidos}-{fecha}.pdf.
 */
export class ExportFichaSeguimientoPdfController {
  constructor({ exportFichaSeguimientoPdfUseCase, logger }) {
    if (!exportFichaSeguimientoPdfUseCase) {
      throw new Error('exportFichaSeguimientoPdfUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportFichaSeguimientoPdfUseCase = exportFichaSeguimientoPdfUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      this.logger.info('[Supervisión docente] Request de exportación PDF de ficha', { id });

      const { buffer, fileName, mimeType } = await this.exportFichaSeguimientoPdfUseCase.execute({
        id,
      });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Supervisión docente] Error al exportar ficha a PDF', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
