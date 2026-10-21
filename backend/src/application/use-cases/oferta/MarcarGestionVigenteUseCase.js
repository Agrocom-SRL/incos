import { NotFoundError } from '../../../domain/errors/AppError.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { entityToPresentation } from '../../mappers/academico/ManagementMapper.js';

export class MarcarGestionVigenteUseCase {
  constructor({ managementRepository, logger }) {
    this.managementRepository = managementRepository;
    this.logger = logger;
  }

  async execute(gestionId, userId = null) {
    const gestion = await this.managementRepository.findById(gestionId);
    if (!gestion) throw new NotFoundError('gestión académica');

    const Model = this.managementRepository.getModel();
    // Desmarcar y marcar van en una sola transacción: si falla el segundo paso no queda sin vigente.
    const updated = await sequelize.transaction(async (transaction) => {
      await Model.update(
        { vigente: false, updatedBy: userId },
        { where: { deletedAt: null }, transaction }
      );
      return this.managementRepository.update(gestionId, { vigente: true }, userId, { transaction });
    });
    this.logger.info('[Oferta] Gestión marcada vigente', { gestionId });
    return { gestion: entityToPresentation(updated) };
  }
}
