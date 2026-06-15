import { ValidationError } from '../../../domain/errors/AppError.js';

export class CreateMateriaUseCase {
  constructor({ subjectRepository, logger }) {
    this.subjectRepository = subjectRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    const sigla = body.sigla ?? body.acronym ?? null;
    const nombre = body.nombre ?? body.name ?? null;
    if (!sigla) throw new ValidationError('sigla es requerida');
    if (!nombre) throw new ValidationError('nombre es requerido');

    const created = await this.subjectRepository.create(
      {
        acronym: sigla,
        name: nombre,
        objectives: body.objetivos ?? body.objectives ?? undefined,
        knowledgeArea: body.areaConocimiento ?? body.knowledgeArea ?? undefined,
        classification: body.clasificacion ?? body.classification ?? undefined,
        type: body.tipo ?? body.type ?? undefined,
        active: body.activo ?? body.active ?? true,
      },
      userId
    );

    this.logger.info('Materia creada', { id: created.id });
    return { materia: created };
  }
}

