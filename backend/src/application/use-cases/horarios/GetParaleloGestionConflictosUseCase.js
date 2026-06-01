import { NotFoundError } from '../../../domain/errors/index.js';

export class GetParaleloGestionConflictosUseCase {
  constructor({ parallelManagementRepository, horarioConflictosService, logger }) {
    this.parallelManagementRepository = parallelManagementRepository;
    this.horarioConflictosService = horarioConflictosService;
    this.logger = logger;
  }

  async execute(paraleloGestionId) {
    const pgId = Number(paraleloGestionId);
    if (!Number.isFinite(pgId) || pgId < 1) {
      throw new NotFoundError('Paralelo en gestión');
    }

    const pg = await this.parallelManagementRepository.findById(pgId);
    if (!pg) throw new NotFoundError('Paralelo en gestión', pgId);

    const conflictos = await this.horarioConflictosService.listarConflictosParaleloGestion(pgId);

    this.logger.info('[Horarios] Conflictos paralelo_gestion', {
      paraleloGestionId: pgId,
      total: conflictos.length,
    });

    return {
      paralelo_gestion_id: pgId,
      conflictos,
    };
  }
}
