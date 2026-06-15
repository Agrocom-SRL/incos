import { NotFoundError } from '../../../domain/errors/AppError.js';
import { entityToPresentation } from '../../mappers/oferta/ParallelManagementPresentationMapper.js';
import { autoOfertarParaleloGestion } from './autoOfertarParaleloGestion.js';

export class UpdateParaleloGestionUseCase {
  constructor({ parallelManagementRepository, courseOfferRepository, logger }) {
    this.parallelManagementRepository = parallelManagementRepository;
    this.courseOfferRepository = courseOfferRepository;
    this.logger = logger;
  }

  async execute(id, payload, userId = null) {
    const existing = await this.parallelManagementRepository.findById(id);
    if (!existing) throw new NotFoundError('paralelo de gestión');

    const update = {};
    if (payload.aula_id !== undefined) update.classroomId = payload.aula_id;
    if (payload.aulaId !== undefined) update.classroomId = payload.aulaId;
    if (payload.cupo_maximo !== undefined) update.maxCapacity = payload.cupo_maximo;
    if (payload.cupoMaximo !== undefined) update.maxCapacity = payload.cupoMaximo;
    if (payload.cupo_minimo !== undefined) update.minCapacity = payload.cupo_minimo;
    if (payload.cupoMinimo !== undefined) update.minCapacity = payload.cupoMinimo;
    if (payload.observaciones !== undefined) update.observations = payload.observaciones;

    const updated = await this.parallelManagementRepository.update(id, update, userId);

    // Asignar aula puede completar las condiciones de oferta (aula + docentes):
    // se intenta auto-ofertar (no-op si aún falta algo).
    if (update.classroomId) {
      await autoOfertarParaleloGestion(
        {
          parallelManagementRepository: this.parallelManagementRepository,
          courseOfferRepository: this.courseOfferRepository,
          logger: this.logger,
        },
        id,
        userId,
      );
    }

    return { paraleloGestion: entityToPresentation(updated) };
  }
}
