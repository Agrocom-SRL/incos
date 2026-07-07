import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { CATEGORIAS_AULA_VALUES } from '../../../domain/constants/cursos.constants.js';

export class UpdateAulaUseCase {
  constructor({ classroomRepository, logger }) {
    this.classroomRepository = classroomRepository;
    this.logger = logger;
  }

  async execute(id, body = {}, userId = null) {
    const existing = await this.classroomRepository.findById(id);
    if (!existing) throw new NotFoundError('aula');

    const categoria = body.categoria ?? body.category ?? undefined;
    if (categoria !== undefined && categoria !== null && !CATEGORIAS_AULA_VALUES.includes(categoria)) {
      throw new ValidationError(
        `categoria inválida. Valores permitidos: ${CATEGORIAS_AULA_VALUES.join(', ')}`
      );
    }

    const updated = await this.classroomRepository.update(
      id,
      {
        code: body.codigo ?? body.code ?? undefined,
        name: body.nombre ?? body.name ?? undefined,
        category: categoria,
        capacity: body.capacidad ?? body.capacity ?? undefined,
        observations: body.observaciones ?? body.observations ?? undefined,
        active: body.activo ?? body.active ?? undefined,
      },
      userId
    );

    this.logger.info('Aula actualizada', { id });
    return { aula: updated };
  }
}
