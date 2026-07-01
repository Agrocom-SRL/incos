/**
 * GET /api/v1/calificaciones/mi-boletin/pdf
 * Descarga el PDF del Boletín del estudiante de la sesión.
 * El estudiante y su paralelo se resuelven en servidor (lo hace el use case).
 */
export class ExportMiBoletinEstudianteController {
  /**
   * @param {Object} params
   * @param {Object} params.exportMiBoletinEstudiantePdfUseCase
   * @param {Object} params.logger
   */
  constructor({ exportMiBoletinEstudiantePdfUseCase, logger }) {
    if (!exportMiBoletinEstudiantePdfUseCase) {
      throw new Error('exportMiBoletinEstudiantePdfUseCase es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.exportMiBoletinEstudiantePdfUseCase = exportMiBoletinEstudiantePdfUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;

      this.logger.info('[Calificaciones] Mi boletín PDF solicitado', { usuarioId });

      const { buffer, fileName, mimeType } =
        await this.exportMiBoletinEstudiantePdfUseCase.execute({ usuarioId });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Calificaciones] Error al exportar mi boletín PDF', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default ExportMiBoletinEstudianteController;
