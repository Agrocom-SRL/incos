import { NotFoundError } from '../../../domain/errors/AppError.js';
import { ParallelMapper } from '../../mappers/academico/index.js';

export class GetParaleloByIdUseCase {
  constructor({
    parallelRepository,
    careerRepository,
    periodRepository,
    logger,
  }) {
    this.parallelRepository = parallelRepository;
    this.careerRepository = careerRepository;
    this.periodRepository = periodRepository;
    this.logger = logger;
  }

  async execute(id) {
    const entity = await this.parallelRepository.findById(id);
    if (!entity) {
      throw new NotFoundError('paralelo');
    }

    const paralelo = ParallelMapper.entityToPresentation(entity);

    if (entity.careerId) {
      const carrera = await this.careerRepository.findById(entity.careerId);
      if (carrera) {
        paralelo.carreraNombre = carrera.name;
        paralelo.carreraCodigo = carrera.code;
      }
    }

    if (entity.periodId) {
      const periodo = await this.periodRepository.findById(entity.periodId);
      if (periodo) {
        paralelo.periodoNombre = periodo.name;
        paralelo.periodoNumero = periodo.number;
      }
    }

    return { paralelo };
  }
}
