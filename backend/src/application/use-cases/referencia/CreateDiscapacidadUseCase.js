import { ValidationError } from '../../../domain/errors/AppError.js';

export class CreateDiscapacidadUseCase {
  constructor({ disabilityTypeRepository, logger }) {
    this.disabilityTypeRepository = disabilityTypeRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    const nombre = body.nombre ?? body.name ?? null;
    if (!nombre) throw new ValidationError('nombre es requerido');

    const created = await this.disabilityTypeRepository.create(
      {
        name: nombre,
        description: body.descripcion ?? body.description ?? undefined,
        active: body.activo ?? body.active ?? true,
      },
      userId
    );

    this.logger.info('Tipo de discapacidad creado', { id: created.id });
    return { discapacidad: created };
  }
}
