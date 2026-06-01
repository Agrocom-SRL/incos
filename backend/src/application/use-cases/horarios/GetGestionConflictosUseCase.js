import { NotFoundError } from '../../../domain/errors/index.js';

export class GetGestionConflictosUseCase {
  constructor({
    managementRepository,
    managementPlanRepository,
    parallelManagementRepository,
    horarioConflictosService,
    logger,
  }) {
    this.managementRepository = managementRepository;
    this.managementPlanRepository = managementPlanRepository;
    this.parallelManagementRepository = parallelManagementRepository;
    this.horarioConflictosService = horarioConflictosService;
    this.logger = logger;
  }

  async execute(gestionId) {
    const gId = Number(gestionId);
    if (!Number.isFinite(gId) || gId < 1) {
      throw new NotFoundError('Gestión');
    }

    const gestion = await this.managementRepository.findById(gId);
    if (!gestion) throw new NotFoundError('Gestión', gId);

    const { rows: planes } = await this.managementPlanRepository.findPlanesDocenteAsignacionCatalog({
      gestionId: gId,
      page: 1,
      limit: 500,
    });

    const paralelos = [];
    const conflictos = [];

    for (const plan of planes) {
      const planId = Number(plan.id ?? plan.gestionPlanId);
      if (!Number.isFinite(planId)) continue;

      const pgs = await this.parallelManagementRepository.findEnrichedByManagementPlanId(planId);
      for (const pg of pgs) {
        const pgId = Number(pg.id);
        const lista = await this.horarioConflictosService.listarConflictosParaleloGestion(pgId);
        if (lista.length) {
          const paraleloId = Number(pg.paraleloId ?? pg.parallelId ?? pg.paralelo_id) || null;
          paralelos.push({
            paralelo_gestion_id: pgId,
            paralelo_id: paraleloId,
            paralelo_nombre: pg.paraleloNombre ?? null,
            turno: pg.turno ?? null,
            total: lista.length,
          });
          conflictos.push(
            ...lista.map((c) => ({
              ...c,
              paralelo_gestion_id: pgId,
              paralelo_id: paraleloId,
              paralelo_nombre: pg.paraleloNombre ?? null,
              turno: pg.turno ?? null,
            }))
          );
        }
      }
    }

    this.logger.info('[Horarios] Conflictos gestión', {
      gestionId: gId,
      paralelosConConflictos: paralelos.length,
      conflictos: conflictos.length,
    });

    return {
      gestion_id: gId,
      paralelos,
      conflictos,
    };
  }
}
