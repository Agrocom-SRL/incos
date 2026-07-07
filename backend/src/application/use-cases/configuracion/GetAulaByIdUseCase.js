import { ClassroomMapper } from '../../mappers/configuracion/index.js';

export class GetAulaByIdUseCase {
  constructor({ classroomRepository, logger }) {
    this.classroomRepository = classroomRepository;
    this.logger = logger;
  }

  async execute(id) {
    const entity = await this.classroomRepository.findById(id, { paranoid: false });
    if (!entity) return null;

    return ClassroomMapper.entityToPresentation(entity);
  }
}
