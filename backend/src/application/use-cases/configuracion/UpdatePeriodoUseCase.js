import { NotFoundError } from '../../../domain/errors/AppError.js';

export class UpdatePeriodoUseCase {
  constructor({ periodRepository, logger }) {
    this.periodRepository = periodRepository;
    this.logger = logger;
  }

  async execute(id, body = {}, userId = null) {
    const existing = await this.periodRepository.findById(id);
    if (!existing) throw new NotFoundError('periodo');

    const updated = await this.periodRepository.update(
      id,
      {
        name: body.nombre ?? undefined,
        number: body.numero ?? undefined,
        displayOrder: body.orden_visualizacion ?? body.ordenVisualizacion ?? undefined,
        description: body.descripcion ?? undefined,
        active: body.activo ?? undefined,
      },
      userId
    );
    return { periodo: updated };
  }
}
