import { NotFoundError } from '../../../domain/errors/AppError.js';

export class UpdateDiscapacidadUseCase {
  constructor({ disabilityTypeRepository, logger }) {
    this.disabilityTypeRepository = disabilityTypeRepository;
    this.logger = logger;
  }

  async execute(id, body = {}, userId = null) {
    const existing = await this.disabilityTypeRepository.findById(id);
    if (!existing) throw new NotFoundError('tipo de discapacidad');

    const updated = await this.disabilityTypeRepository.update(
      id,
      {
        name: body.nombre ?? body.name ?? undefined,
        description: body.descripcion ?? body.description ?? undefined,
        active: body.activo ?? body.active ?? undefined,
      },
      userId
    );

    this.logger.info('Tipo de discapacidad actualizado', { id });
    return { discapacidad: updated };
  }
}
