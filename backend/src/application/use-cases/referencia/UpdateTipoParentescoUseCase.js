import { NotFoundError } from '../../../domain/errors/AppError.js';

export class UpdateTipoParentescoUseCase {
  constructor({ relationshipTypeRepository, logger }) {
    this.relationshipTypeRepository = relationshipTypeRepository;
    this.logger = logger;
  }

  async execute(id, body = {}, userId = null) {
    const existing = await this.relationshipTypeRepository.findById(id);
    if (!existing) throw new NotFoundError('tipo de parentesco');

    const updated = await this.relationshipTypeRepository.update(
      id,
      {
        name: body.nombre ?? body.name ?? undefined,
        description: body.descripcion ?? body.description ?? undefined,
        active: body.activo ?? body.active ?? undefined,
      },
      userId
    );

    this.logger.info('Tipo de parentesco actualizado', { id });
    return { tipoParentesco: updated };
  }
}
