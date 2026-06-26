/**
 * GET /api/v1/calificaciones/centralizador/:paraleloGestionId/estudiante/:estudianteId/boletin
 * Descarga el PDF del Boletín de Calificaciones de un estudiante.
 */
export class ExportBoletinEstudianteController {
  constructor({ exportBoletinEstudiantePdfUseCase, logger }) {
    if (!exportBoletinEstudiantePdfUseCase) {
      throw new Error('exportBoletinEstudiantePdfUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportBoletinEstudiantePdfUseCase = exportBoletinEstudiantePdfUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const paraleloGestionId = req.params?.paraleloGestionId ?? req.query?.paraleloGestionId;
      const estudianteId = req.params?.estudianteId ?? req.query?.estudianteId;

      this.logger.info('[Calificaciones] Export boletín estudiante', {
        paraleloGestionId,
        estudianteId
      });

      const { buffer, fileName, mimeType } = await this.exportBoletinEstudiantePdfUseCase.execute({
        paraleloGestionId,
        estudianteId
      });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Calificaciones] Error export boletín estudiante', {
        error: error.message,
        stack: error.stack
      });
      return next(error);
    }
  }
}

export default ExportBoletinEstudianteController;
