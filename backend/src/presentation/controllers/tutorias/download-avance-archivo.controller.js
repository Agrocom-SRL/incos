/**
 * GET /api/v1/proyectos-grado/:id/avances/:avanceId/archivo (T21)
 * Descarga autenticada del archivo del avance (res.download; NUNCA URL
 * estática /uploads). Guard integrante si el usuario es estudiante.
 */
export class DownloadAvanceArchivoController {
  constructor({ downloadAvanceArchivoUseCase, logger }) {
    if (!downloadAvanceArchivoUseCase) {
      throw new Error('downloadAvanceArchivoUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.downloadAvanceArchivoUseCase = downloadAvanceArchivoUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const proyectoGradoId = parseInt(req.params.id, 10);
      const avanceId = parseInt(req.params.avanceId, 10);
      const usuarioId = req.usuario?.id;
      this.logger.info('[Tutorías] Request de descarga de avance', { proyectoGradoId, avanceId });

      const { absolutePath, fileName } = await this.downloadAvanceArchivoUseCase.execute({
        proyectoGradoId,
        avanceId,
        usuarioId,
      });

      return res.download(absolutePath, fileName);
    } catch (error) {
      this.logger.error('[Tutorías] Error al descargar avance', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
