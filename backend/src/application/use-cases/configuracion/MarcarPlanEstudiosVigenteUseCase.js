import { NotFoundError } from '../../../domain/errors/AppError.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';

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
    // Una sola transacción: si falla el segundo paso la carrera no queda sin plan vigente.
    const updated = await sequelize.transaction(async (transaction) => {
      await Model.update(
        { vigente: false, updatedBy: userId },
        { where: { carreraId: plan.careerId }, transaction }
      );
      return this.studyPlanRepository.update(id, { isActive: true }, userId, { transaction });
    });
    this.logger.info('Plan marcado vigente', { id, carreraId: plan.careerId });
    return { plan_estudio: updated };
  }
}
