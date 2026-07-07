import { NotFoundError } from '../../../domain/errors/AppError.js';

export class UpdateEstadoCivilUseCase {
  constructor({ civilStatusRepository, logger }) {
    this.civilStatusRepository = civilStatusRepository;
    this.logger = logger;
  }

  async execute(id, body = {}, userId = null) {
    const existing = await this.civilStatusRepository.findById(id);
    if (!existing) throw new NotFoundError('estado civil');

    const updated = await this.civilStatusRepository.update(
      id,
      {
        name: body.nombre ?? body.name ?? undefined,
        abbreviation: body.abreviatura ?? body.abbreviation ?? undefined,
        active: body.activo ?? body.active ?? undefined,
      },
      userId
    );

    this.logger.info('Estado civil actualizado', { id });
    return { estadoCivil: updated };
  }
}
