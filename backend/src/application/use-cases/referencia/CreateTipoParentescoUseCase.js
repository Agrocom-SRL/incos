import { ValidationError } from '../../../domain/errors/AppError.js';

export class CreateTipoParentescoUseCase {
  constructor({ relationshipTypeRepository, logger }) {
    this.relationshipTypeRepository = relationshipTypeRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    const nombre = body.nombre ?? body.name ?? null;
    if (!nombre) throw new ValidationError('nombre es requerido');

    const created = await this.relationshipTypeRepository.create(
      {
        name: nombre,
        description: body.descripcion ?? body.description ?? undefined,
        active: body.activo ?? body.active ?? true,
      },
      userId
    );

    this.logger.info('Tipo de parentesco creado', { id: created.id });
    return { tipoParentesco: created };
  }
}
