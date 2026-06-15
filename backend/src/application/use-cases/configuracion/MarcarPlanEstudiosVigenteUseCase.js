import { NotFoundError } from '../../../domain/errors/AppError.js';

export class MarcarPlanEstudiosVigenteUseCase {
  constructor({ studyPlanRepository, logger }) {
    this.studyPlanRepository = studyPlanRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const plan = await this.studyPlanRepository.findById(id);
    if (!plan) throw new NotFoundError('plan de estudios');

    // Desmarcar todos los planes de la misma carrera y marcar este.
    // Usamos el repositorio base: para update masivo usamos el modelo Sequelize directamente.
    const Model = this.studyPlanRepository.getModel();
    await Model.update(
      { vigente: false, updatedBy: userId },
      { where: { carreraId: plan.careerId } }
    );

    const updated = await this.studyPlanRepository.update(id, { isActive: true }, userId);
    this.logger.info('Plan marcado vigente', { id, carreraId: plan.careerId });
    return { plan_estudio: updated };
  }
}

