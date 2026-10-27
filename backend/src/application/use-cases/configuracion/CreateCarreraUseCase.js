import { ConflictError, ValidationError } from '../../../domain/errors/AppError.js';

export class CreateCarreraUseCase {
  constructor({ careerRepository, logger }) {
    this.careerRepository = careerRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    if (!body?.nombre) {
      throw new ValidationError('nombre es requerido');
    }
    const code = body.codigo ?? body.code ?? undefined;
    if (code !== undefined && code !== null) {
      // El código identifica la carrera: no se repite entre carreras vigentes (activas o inactivas).
      // Las eliminadas (soft delete) quedan fuera por el paranoid del modelo y su código se puede reutilizar.
      const existente = await this.careerRepository.findBy({ code: String(code).trim() }, { includeInactive: true });
      if (existente) {
        throw new ConflictError(`Ya existe una carrera con el código ${String(code).trim()}`);
      }
    }
    const created = await this.careerRepository.create(
      {
        code,
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
