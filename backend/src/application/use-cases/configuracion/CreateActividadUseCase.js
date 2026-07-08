import { ValidationError } from '../../../domain/errors/AppError.js';
import { TIPOS_ACTIVIDAD_VALUES } from '../../../domain/constants/index.js';

export class CreateActividadUseCase {
  constructor({ activityRepository, logger }) {
    this.activityRepository = activityRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    const nombre = body.nombre ?? body.name ?? null;
    if (!nombre) throw new ValidationError('nombre es requerido');

    const tipo = body.tipo ?? body.type ?? undefined;
    if (tipo !== undefined && tipo !== null && !TIPOS_ACTIVIDAD_VALUES.includes(tipo)) {
      throw new ValidationError(
        `tipo inválido. Valores permitidos: ${TIPOS_ACTIVIDAD_VALUES.join(', ')}`
      );
    }

    const created = await this.activityRepository.create(
      {
        name: nombre,
        description: body.descripcion ?? body.description ?? undefined,
        type: tipo,
        isHighlighted: body.esDestacada ?? body.isHighlighted ?? false,
        icon: (body.icono ?? body.icon ?? '')?.toString().trim() || undefined,
        active: body.activo ?? body.active ?? true,
      },
      userId
    );

    this.logger.info('Actividad creada', { id: created.id });
    return { actividad: created };
  }
}
