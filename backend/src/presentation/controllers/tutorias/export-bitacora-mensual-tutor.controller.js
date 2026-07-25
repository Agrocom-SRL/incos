/**
 * GET /api/v1/proyectos-grado/reportes/bitacora-mensual?mes=&gestionId= (T5)
 * PDF del reporte mensual de tutorías por tutor (vista 163).
 * Permiso: tutorias.titulacion.proyecto EXPORTAR. Respuesta binaria (PDF).
 */
export class ExportBitacoraMensualTutorController {
  constructor({ exportBitacoraMensualTutorPdfUseCase, logger }) {
    if (!exportBitacoraMensualTutorPdfUseCase) {
      throw new Error('exportBitacoraMensualTutorPdfUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportBitacoraMensualTutorPdfUseCase = exportBitacoraMensualTutorPdfUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { mes, gestionId, tutorId } = req.query;
      this.logger.info('[Tutorías] Request exportación PDF bitácora mensual', { mes, gestionId });

      const { buffer, fileName, mimeType } =
        await this.exportBitacoraMensualTutorPdfUseCase.execute({ mes, gestionId, tutorId });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Tutorías] Error al exportar bitácora mensual', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
