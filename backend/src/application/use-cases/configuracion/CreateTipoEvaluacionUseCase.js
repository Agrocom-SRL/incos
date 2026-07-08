import { ValidationError } from '../../../domain/errors/AppError.js';

export class CreateTipoEvaluacionUseCase {
  constructor({ evaluationTypeRepository, logger }) {
    this.evaluationTypeRepository = evaluationTypeRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    const codigo = body.codigo ?? body.code ?? null;
    if (!codigo) throw new ValidationError('codigo es requerido');

    const nombre = body.nombre ?? body.name ?? null;
    if (!nombre) throw new ValidationError('nombre es requerido');

    const created = await this.evaluationTypeRepository.create(
      {
        code: codigo,
        name: nombre,
        description: body.descripcion ?? body.description ?? undefined,
        isRecovery: body.esRecuperatorio ?? body.isRecovery ?? false,
        active: body.activo ?? body.active ?? true,
      },
      userId
    );

    this.logger.info('Tipo de evaluación creado', { id: created.id });
    return { tipoEvaluacion: created };
  }
}
