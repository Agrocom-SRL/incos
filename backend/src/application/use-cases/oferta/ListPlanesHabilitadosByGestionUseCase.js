import { NotFoundError } from '../../../domain/errors/AppError.js';
export class ListPlanesHabilitadosByGestionUseCase {
  constructor({ managementRepository, managementPlanRepository, logger }) {
    this.managementRepository = managementRepository;
    this.managementPlanRepository = managementPlanRepository;
    this.logger = logger;
  }

  async execute(gestionId) {
    const gestion = await this.managementRepository.findById(gestionId);
    if (!gestion) throw new NotFoundError('gestión académica');

    const { rows } = await this.managementPlanRepository.findPlanesDocenteAsignacionCatalog({
      gestionId,
      page: 1,
      limit: 500,
    });

    const planesHabilitados = (rows ?? []).map((row) => ({
      id: row.id,
      gestionId: row.gestionId,
      planEstudioId: row.planEstudioId,
      nombre: row.nombre ?? null,
      estado: row.estado,
      planNombre: row.planNombre ?? null,
      planResolucion: row.planResolucion ?? null,
      planVigente: row.planVigente ?? null,
      carreraId: row.carreraId ?? null,
      carreraNombre: row.carreraNombre ?? null,
      carreraCodigo: row.carreraCodigo ?? null,
    }));

    return { planesHabilitados };
  }
}
