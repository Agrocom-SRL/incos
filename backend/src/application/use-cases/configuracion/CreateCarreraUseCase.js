import { ValidationError } from '../../../domain/errors/AppError.js';

export class CreateCarreraUseCase {
  constructor({ careerRepository, logger }) {
    this.careerRepository = careerRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    if (!body?.nombre) {
      throw new ValidationError('nombre es requerido');
    }
    const created = await this.careerRepository.create(
      {
        code: body.codigo ?? body.code ?? undefined,
        name: body.nombre ?? body.name,
        description: body.descripcion ?? body.description ?? undefined,
        trainingArea: body.area_formacion ?? body.areaFormacion ?? body.trainingArea ?? undefined,
        grantedTitle: body.titulo_otorgado ?? body.tituloOtorgado ?? body.grantedTitle ?? undefined,
        colorHex: body.color_hex ?? body.colorHex ?? undefined,
        imagePath: body.imagen_ruta ?? body.imagenRuta ?? body.imagePath ?? undefined,
        active: body.activo ?? body.active ?? true,
      },
      userId
    );
    this.logger.info('Carrera creada', { id: created.id });
    return { carrera: created };
  }
}

