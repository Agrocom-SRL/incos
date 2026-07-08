import { ValidationError } from '../../../domain/errors/AppError.js';

export class CreateEstadoCivilUseCase {
  constructor({ civilStatusRepository, logger }) {
    this.civilStatusRepository = civilStatusRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    const nombre = body.nombre ?? body.name ?? null;
    if (!nombre) throw new ValidationError('nombre es requerido');

    const created = await this.civilStatusRepository.create(
      {
        name: nombre,
        abbreviation: body.abreviatura ?? body.abbreviation ?? undefined,
        active: body.activo ?? body.active ?? true,
      },
      userId
    );

    this.logger.info('Estado civil creado', { id: created.id });
    return { estadoCivil: created };
  }
}
