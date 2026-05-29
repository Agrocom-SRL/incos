import { NotFoundError } from '../../../domain/errors/AppError.js';
import { rowToPresentation } from '../../mappers/oferta/ParallelManagementPresentationMapper.js';

export class GetParaleloGestionByIdUseCase {
  constructor({ parallelManagementRepository, logger }) {
    this.parallelManagementRepository = parallelManagementRepository;
    this.logger = logger;
  }

  async execute(id) {
    const row = await this.parallelManagementRepository.findEnrichedById(id);
    if (!row) throw new NotFoundError('paralelo de gestión');
    return { paraleloGestion: rowToPresentation(row) };
  }
}
