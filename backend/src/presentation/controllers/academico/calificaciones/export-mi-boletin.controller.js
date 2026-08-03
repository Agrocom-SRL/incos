/**
 * GET /api/v1/calificaciones/mi-boletin/pdf?bimestre=<1..4 opcional>
 * Descarga el PDF del Boletín del estudiante de la sesión. Con `bimestre` el
 * boletín es BIMESTRAL (solo ese parcial); sin él, ANUAL.
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
      const bimestre = req.query?.bimestre ?? null;

      this.logger.info('[Calificaciones] Mi boletín PDF solicitado', { usuarioId, bimestre });

      const { buffer, fileName, mimeType } =
        await this.exportMiBoletinEstudiantePdfUseCase.execute({ usuarioId, bimestre });

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
