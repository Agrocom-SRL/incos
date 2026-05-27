import { ValidationError } from '../../../domain/errors/AppError.js';

export class CreatePeriodoUseCase {
  constructor({ periodRepository, logger }) {
    this.periodRepository = periodRepository;
    this.logger = logger;
  }

  async execute(planEstudioId, body = {}, userId = null) {
    const nombre = body.nombre ?? null;
    const numero = body.numero ?? null;
    if (!nombre) throw new ValidationError('nombre es requerido');
    if (!numero) throw new ValidationError('numero es requerido');

    const created = await this.periodRepository.create(
      {
        studyPlanId: planEstudioId,
        name: nombre,
        number: numero,
        displayOrder: body.orden_visualizacion ?? body.ordenVisualizacion ?? numero,
        description: body.descripcion ?? undefined,
        active: body.activo ?? true,
      },
      userId
    );
    return { periodo: created };
  }
}

