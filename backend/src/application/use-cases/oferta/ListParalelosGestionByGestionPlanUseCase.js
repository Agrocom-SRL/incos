import { NotFoundError } from '../../../domain/errors/AppError.js';
import { rowsToPresentation } from '../../mappers/oferta/ParallelManagementPresentationMapper.js';

export class ListParalelosGestionByGestionPlanUseCase {
  constructor({ managementPlanRepository, parallelManagementRepository, logger }) {
    this.managementPlanRepository = managementPlanRepository;
    this.parallelManagementRepository = parallelManagementRepository;
    this.logger = logger;
  }

  async execute(gestionPlanId) {
    const gestionPlan = await this.managementPlanRepository.findById(gestionPlanId);
    if (!gestionPlan) throw new NotFoundError('plan habilitado en gestión');

    const rows = await this.parallelManagementRepository.findEnrichedByManagementPlanId(
      gestionPlanId
    );

    return { paralelosGestion: rowsToPresentation(rows) };
  }
}
