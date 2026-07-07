import { NotFoundError } from '../../../domain/errors/AppError.js';

export class UpdateTipoEvaluacionUseCase {
  constructor({ evaluationTypeRepository, logger }) {
    this.evaluationTypeRepository = evaluationTypeRepository;
    this.logger = logger;
  }

  async execute(id, body = {}, userId = null) {
    const existing = await this.evaluationTypeRepository.findById(id);
    if (!existing) throw new NotFoundError('tipo de evaluación');

    const updated = await this.evaluationTypeRepository.update(
      id,
      {
        code: body.codigo ?? body.code ?? undefined,
        name: body.nombre ?? body.name ?? undefined,
        description: body.descripcion ?? body.description ?? undefined,
        isRecovery: body.esRecuperatorio ?? body.isRecovery ?? undefined,
        active: body.activo ?? body.active ?? undefined,
      },
      userId
    );

    this.logger.info('Tipo de evaluación actualizado', { id });
    return { tipoEvaluacion: updated };
  }
}
