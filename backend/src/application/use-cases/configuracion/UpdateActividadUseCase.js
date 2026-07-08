import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { TIPOS_ACTIVIDAD_VALUES } from '../../../domain/constants/index.js';

export class UpdateActividadUseCase {
  constructor({ activityRepository, logger }) {
    this.activityRepository = activityRepository;
    this.logger = logger;
  }

  async execute(id, body = {}, userId = null) {
    const existing = await this.activityRepository.findById(id);
    if (!existing) throw new NotFoundError('actividad');

    const tipo = body.tipo ?? body.type ?? undefined;
    if (tipo !== undefined && tipo !== null && !TIPOS_ACTIVIDAD_VALUES.includes(tipo)) {
      throw new ValidationError(
        `tipo inválido. Valores permitidos: ${TIPOS_ACTIVIDAD_VALUES.join(', ')}`
      );
    }

    const icono = body.icono ?? body.icon;

    const updated = await this.activityRepository.update(
      id,
      {
        name: body.nombre ?? body.name ?? undefined,
        description: body.descripcion ?? body.description ?? undefined,
        type: tipo,
        isHighlighted: body.esDestacada ?? body.isHighlighted ?? undefined,
        icon: icono !== undefined ? icono?.toString().trim() || null : undefined,
        active: body.activo ?? body.active ?? undefined,
      },
      userId
    );

    this.logger.info('Actividad actualizada', { id });
    return { actividad: updated };
  }
}
