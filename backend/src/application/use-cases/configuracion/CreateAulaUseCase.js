import { ValidationError } from '../../../domain/errors/AppError.js';
import { CATEGORIAS_AULA_VALUES } from '../../../domain/constants/cursos.constants.js';

export class CreateAulaUseCase {
  constructor({ classroomRepository, logger }) {
    this.classroomRepository = classroomRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    const codigo = body.codigo ?? body.code ?? null;
    if (!codigo) throw new ValidationError('codigo es requerido');

    const nombre = body.nombre ?? body.name ?? null;
    if (!nombre) throw new ValidationError('nombre es requerido');

    const categoria = body.categoria ?? body.category ?? undefined;
    if (categoria !== undefined && categoria !== null && !CATEGORIAS_AULA_VALUES.includes(categoria)) {
      throw new ValidationError(
        `categoria inválida. Valores permitidos: ${CATEGORIAS_AULA_VALUES.join(', ')}`
      );
    }

    const created = await this.classroomRepository.create(
      {
        code: codigo,
        name: nombre,
        category: categoria,
        capacity: body.capacidad ?? body.capacity ?? undefined,
        observations: body.observaciones ?? body.observations ?? undefined,
        active: body.activo ?? body.active ?? true,
      },
      userId
    );

    this.logger.info('Aula creada', { id: created.id });
    return { aula: created };
  }
}
