import { NotFoundError } from '../../../domain/errors/AppError.js';

export class UpdateAsignaturaPlanUseCase {
  constructor({ planSubjectRepository, logger }) {
    this.planSubjectRepository = planSubjectRepository;
    this.logger = logger;
  }

  async execute(id, body = {}, userId = null) {
    const existing = await this.planSubjectRepository.findById(id);
    if (!existing) throw new NotFoundError('asignatura_plan');

    const updated = await this.planSubjectRepository.update(
      id,
      {
        weeklyHours: body.horas_semanales ?? body.horasSemanales ?? undefined,
        modality: body.modalidad ?? body.modality ?? undefined,
        displayOrder: body.orden_visualizacion ?? body.ordenVisualizacion ?? undefined,
        active: body.activo ?? undefined,
      },
      userId
    );
    return { asignatura: updated };
  }
}
