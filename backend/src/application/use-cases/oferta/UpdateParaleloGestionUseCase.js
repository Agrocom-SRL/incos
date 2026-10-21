import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ESTADOS_PARALELO_GESTION_DATOS_BLOQUEADOS } from '../../../domain/constants/oferta.constants.js';
import { parseIdOpcional, parseNumero } from '../../utils/validacionEntrada.js';
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
    const aula = payload.aulaId !== undefined ? payload.aulaId : payload.aula_id;
    const cupoMax = payload.cupoMaximo !== undefined ? payload.cupoMaximo : payload.cupo_maximo;
    const cupoMin = payload.cupoMinimo !== undefined ? payload.cupoMinimo : payload.cupo_minimo;

    if (aula !== undefined) update.classroomId = parseIdOpcional(aula, 'aula_id');
    if (cupoMax !== undefined) {
      update.maxCapacity = cupoMax === null ? null : parseNumero(cupoMax, 'cupo_maximo', { min: 1, entero: true });
    }
    if (cupoMin !== undefined) {
      update.minCapacity = cupoMin === null ? null : parseNumero(cupoMin, 'cupo_minimo', { min: 0, entero: true });
    }
    if (payload.observaciones !== undefined) update.observations = payload.observaciones;

    // aula, cupos y turno no se tocan una vez confirmado (PUBLICADO) o cerrado el paralelo.
    const estado = existing.state ?? existing.estado ?? null;
    const cambiaDatosBloqueados =
      update.classroomId !== undefined || update.maxCapacity !== undefined || update.minCapacity !== undefined;
    if (cambiaDatosBloqueados && ESTADOS_PARALELO_GESTION_DATOS_BLOQUEADOS.includes(estado)) {
      throw new ValidationError(
        estado === 'CERRADO'
          ? 'Un paralelo CERRADO no admite cambios de aula ni de cupos'
          : 'Un paralelo PUBLICADO no admite cambios de aula ni de cupos: despublíquelo primero'
      );
    }

    const maxFinal = update.maxCapacity !== undefined ? update.maxCapacity : existing.maxCapacity;
    const minFinal = update.minCapacity !== undefined ? update.minCapacity : existing.minCapacity;
    if (maxFinal != null && minFinal != null && Number(minFinal) > Number(maxFinal)) {
      throw new ValidationError('cupo_minimo no puede ser mayor que cupo_maximo');
    }

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
