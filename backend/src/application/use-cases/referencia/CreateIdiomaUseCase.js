import { ValidationError } from '../../../domain/errors/AppError.js';

export class CreateIdiomaUseCase {
  constructor({ languageRepository, logger }) {
    this.languageRepository = languageRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    const nombre = body.nombre ?? body.name ?? null;
    if (!nombre) throw new ValidationError('nombre es requerido');

    const created = await this.languageRepository.create(
      {
        name: nombre,
        isoCode: body.codigoIso ?? body.isoCode ?? undefined,
        active: body.activo ?? body.active ?? true,
      },
      userId
    );

    this.logger.info('Idioma creado', { id: created.id });
    return { idioma: created };
  }
}
