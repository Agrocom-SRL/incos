import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ESTADOS_GESTION_PLAN_VALUES } from '../../../domain/constants/cursos.constants.js';
import { entityToPresentation } from '../../mappers/oferta/ManagementPlanPresentationMapper.js';

export class UpdateGestionPlanEstadoUseCase {
  constructor({ managementPlanRepository, logger }) {
    this.managementPlanRepository = managementPlanRepository;
    this.logger = logger;
  }

  async execute(gestionPlanId, { estado }, userId = null) {
    if (!estado || !ESTADOS_GESTION_PLAN_VALUES.includes(estado)) {
      throw new ValidationError('estado inválido para gestión-plan');
    }

    const plan = await this.managementPlanRepository.findById(gestionPlanId);
    if (!plan) throw new NotFoundError('plan habilitado en gestión');

    const updated = await this.managementPlanRepository.update(
      gestionPlanId,
      { state: estado },
      userId
    );

    return { gestionPlan: entityToPresentation(updated) };
  }
}
