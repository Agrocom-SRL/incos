/**
 * GET /api/v1/proyectos-grado/reportes/avance-carrera/pdf?gestionId=&carreraId=
 * Requisito 2 — extensión 2026-07-31.
 * PDF del reporte de avance de tutorías por carrera.
 * Permiso: titulacion.proyecto EXPORTAR. Respuesta binaria (PDF).
 */
export class ExportAvanceTutoriaCarreraPdfController {
  constructor({ exportAvanceTutoriaCarreraPdfUseCase, logger }) {
    if (!exportAvanceTutoriaCarreraPdfUseCase) {
      throw new Error('exportAvanceTutoriaCarreraPdfUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportAvanceTutoriaCarreraPdfUseCase = exportAvanceTutoriaCarreraPdfUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { gestionId, carreraId } = req.query;
      this.logger.info('[Titulación] Request exportación PDF avance de tutorías por carrera', {
        gestionId,
        carreraId,
      });

      const { buffer, fileName, mimeType } =
        await this.exportAvanceTutoriaCarreraPdfUseCase.execute({
          gestionId,
          carreraId,
        });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Titulación] Error al exportar avance de tutorías por carrera', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
