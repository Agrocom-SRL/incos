/**
 * GET /api/v1/inscripciones-capacitacion/:id/formulario-pdf
 * Descarga el PDF del Formulario de Inscripción de una inscripción de capacitación.
 *
 * Permiso: capacitacion.inscripcion DETALLE.
 */
export class ExportFormularioInscripcionCapacitacionController {
  /**
   * @param {Object} params
   * @param {import('../../../application/use-cases/capacitacion/ExportFormularioInscripcionCapacitacionPdfUseCase.js').ExportFormularioInscripcionCapacitacionPdfUseCase} params.exportFormularioInscripcionCapacitacionPdfUseCase
   * @param {Object} params.logger
   */
  constructor({ exportFormularioInscripcionCapacitacionPdfUseCase, logger }) {
    if (!exportFormularioInscripcionCapacitacionPdfUseCase) {
      throw new Error('exportFormularioInscripcionCapacitacionPdfUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportFormularioInscripcionCapacitacionPdfUseCase =
      exportFormularioInscripcionCapacitacionPdfUseCase;
    this.logger = logger;
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async handle(req, res, next) {
    try {
      const inscripcionId = req.params.id;

      this.logger.info('[Capacitación] Request formulario de inscripción PDF', { inscripcionId });

      const { buffer, fileName, mimeType } =
        await this.exportFormularioInscripcionCapacitacionPdfUseCase.execute({ inscripcionId });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Capacitación] Error al exportar formulario de inscripción PDF', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default ExportFormularioInscripcionCapacitacionController;
