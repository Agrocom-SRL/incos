export class UploadCarreraImagenController {
  constructor({ uploadCarreraImagenUseCase, logger, responseFormatter }) {
    this.uploadCarreraImagenUseCase = uploadCarreraImagenUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const codigo = req.body?.codigo ?? req.body?.code;
      const result = this.uploadCarreraImagenUseCase.execute({
        codigo,
        file: req.file,
      });
      return res.status(200).json({
        success: true,
        data: { carreraImagen: result },
        message: 'Imagen subida correctamente',
      });
    } catch (error) {
      this.logger.error('Error al subir imagen de carrera', { error: error.message });
      return next(error);
    }
  }
}
