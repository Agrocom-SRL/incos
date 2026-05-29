import { NotFoundError } from '../../../domain/errors/AppError.js';
import { rowsToPresentation } from '../../mappers/oferta/CourseOfferPresentationMapper.js';

export class ListOfertaCursosByParaleloGestionUseCase {
  constructor({ parallelManagementRepository, courseOfferRepository, logger }) {
    this.parallelManagementRepository = parallelManagementRepository;
    this.courseOfferRepository = courseOfferRepository;
    this.logger = logger;
  }

  async execute(parallelManagementId) {
    const pg = await this.parallelManagementRepository.findById(parallelManagementId);
    if (!pg) throw new NotFoundError('paralelo de gestión');

    const rows = await this.courseOfferRepository.findEnrichedByParallelManagementId(
      parallelManagementId
    );

    return { ofertaCursos: rowsToPresentation(rows) };
  }
}
