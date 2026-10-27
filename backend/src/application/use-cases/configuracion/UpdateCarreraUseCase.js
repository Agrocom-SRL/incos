import { ConflictError, NotFoundError } from '../../../domain/errors/AppError.js';

export class UpdateCarreraUseCase {
  constructor({ careerRepository, logger }) {
    this.careerRepository = careerRepository;
    this.logger = logger;
  }

  async execute(id, body = {}, userId = null) {
    const existing = await this.careerRepository.findById(id);
    if (!existing) throw new NotFoundError('carrera');

    const code = body.codigo ?? body.code ?? undefined;
    if (code !== undefined && code !== null) {
      // El código identifica la carrera: no puede coincidir con el de otra carrera vigente (activa o inactiva).
      const codigo = String(code).trim();
      const otra = await this.careerRepository.findBy({ code: codigo }, { includeInactive: true });
      const otraId = otra?.id ?? otra?.toPlainObject?.().id;
      if (otra && String(otraId) !== String(id)) {
        throw new ConflictError(`Ya existe una carrera con el código ${codigo}`);
      }
    }

    const updated = await this.careerRepository.update(
      id,
      {
        code: body.codigo ?? body.code ?? undefined,
        name: body.nombre ?? body.name ?? undefined,
        description: body.descripcion ?? body.description ?? undefined,
        trainingArea: body.area_formacion ?? body.areaFormacion ?? body.trainingArea ?? undefined,
        grantedTitle: body.titulo_otorgado ?? body.tituloOtorgado ?? body.grantedTitle ?? undefined,
        colorHex: body.color_hex ?? body.colorHex ?? undefined,
        imagePath: body.imagen_ruta ?? body.imagenRuta ?? body.imagePath ?? undefined,
        active: body.activo ?? body.active ?? undefined,
      },
      userId
    );
    this.logger.info('Carrera actualizada', { id });
    return { carrera: updated };
  }
}
