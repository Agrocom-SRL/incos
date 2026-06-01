import { NotFoundError } from '../../../domain/errors/AppError.js';
import { rowToPresentation } from '../../mappers/oferta/ParallelManagementPresentationMapper.js';

export class ListParalelosGestionByParaleloUseCase {
  constructor({ parallelRepository, parallelManagementRepository, logger }) {
    this.parallelRepository = parallelRepository;
    this.parallelManagementRepository = parallelManagementRepository;
    this.logger = logger;
  }

  async execute(parallelId) {
    const id = Number(parallelId);
    if (!Number.isFinite(id) || id < 1) {
      throw new NotFoundError('paralelo');
    }

    const entity = await this.parallelRepository.findById(id);
    if (!entity) {
      throw new NotFoundError('paralelo');
    }

    const rows = await this.parallelManagementRepository.findEnrichedByParallelId(id);
    const paralelosGestion = (rows || []).map((row) => ({
      ...rowToPresentation(row),
      gestionId: row.gestionId ?? null,
      gestionCodigo: row.gestionCodigo ?? null,
      gestionNombre: row.gestionNombre ?? null,
      gestionAnio: row.gestionAnio ?? null,
      gestionVigente: row.gestionVigente != null ? !!row.gestionVigente : false,
    }));

    this.logger.info('[CFG] Paralelos gestión por maestro', {
      paraleloId: id,
      total: paralelosGestion.length,
    });

    return { paralelosGestion };
  }
}
