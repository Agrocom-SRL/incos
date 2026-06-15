import { NotFoundError } from '../../../domain/errors/AppError.js';
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
    await Model.update(
      { vigente: false, updatedBy: userId },
      { where: { deletedAt: null } }
    );
    const updated = await this.managementRepository.update(gestionId, { vigente: true }, userId);
    this.logger.info('[Oferta] Gestión marcada vigente', { gestionId });
    return { gestion: entityToPresentation(updated) };
  }
}
