export class ListAulasCatalogUseCase {
  constructor({ classroomRepository, logger }) {
    this.classroomRepository = classroomRepository;
    this.logger = logger;
  }

  async execute() {
    const result = await this.classroomRepository.findAll(
      { includeInactive: false },
      1,
      500
    );
    const items = result.classrooms ?? result.items ?? [];
    const aulas = items.map((a) => ({
      id: a.id,
      codigo: a.code ?? null,
      nombre: a.name ?? null,
      capacidad: a.capacity ?? null,
      categoria: a.category ?? null,
    }));
    return { aulas };
  }
}
