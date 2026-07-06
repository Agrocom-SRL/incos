import { NotFoundError } from '../../../domain/errors/AppError.js';

export class UpdateIdiomaUseCase {
  constructor({ languageRepository, logger }) {
    this.languageRepository = languageRepository;
    this.logger = logger;
  }

  async execute(id, body = {}, userId = null) {
    const existing = await this.languageRepository.findById(id);
    if (!existing) throw new NotFoundError('idioma');

    const updated = await this.languageRepository.update(
      id,
      {
        name: body.nombre ?? body.name ?? undefined,
        isoCode: body.codigoIso ?? body.isoCode ?? undefined,
        active: body.activo ?? body.active ?? undefined,
      },
      userId
    );

    this.logger.info('Idioma actualizado', { id });
    return { idioma: updated };
  }
}
