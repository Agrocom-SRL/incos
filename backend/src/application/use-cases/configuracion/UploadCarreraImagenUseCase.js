import { ValidationError } from '../../../domain/errors/AppError.js';
import { UPLOAD } from '../../../infrastructure/config/uploads.config.js';

export class UploadCarreraImagenUseCase {
  constructor({ logger }) {
    this.logger = logger;
  }

  /**
   * @param {{ codigo: string, file: Express.Multer.File }} params
   */
  execute({ codigo, file }) {
    if (!codigo?.trim()) {
      throw new ValidationError('codigo es requerido para nombrar la imagen');
    }
    if (!file?.filename) {
      throw new ValidationError('No se recibió ningún archivo de imagen');
    }

    const imagenRuta = UPLOAD.carreraImagePublicPath(file.filename);
    this.logger.info('Imagen de carrera subida', { codigo, imagenRuta });
    return { imagenRuta };
  }
}
