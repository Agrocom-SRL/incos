import { NotFoundError } from '../../../domain/errors/AppError.js';

export class UpdateMateriaUseCase {
  constructor({ subjectRepository, logger }) {
    this.subjectRepository = subjectRepository;
    this.logger = logger;
  }

  async execute(id, body = {}, userId = null) {
    const existing = await this.subjectRepository.findById(id);
    if (!existing) throw new NotFoundError('materia');

    const updated = await this.subjectRepository.update(
      id,
      {
        acronym: body.sigla ?? body.acronym ?? undefined,
        name: body.nombre ?? body.name ?? undefined,
        objectives: body.objetivos ?? body.objectives ?? undefined,
        knowledgeArea: body.areaConocimiento ?? body.knowledgeArea ?? undefined,
        classification: body.clasificacion ?? body.classification ?? undefined,
        type: body.tipo ?? body.type ?? undefined,
        active: body.activo ?? body.active ?? undefined,
      },
      userId
    );

    this.logger.info('Materia actualizada', { id });
    return { materia: updated };
  }
}

