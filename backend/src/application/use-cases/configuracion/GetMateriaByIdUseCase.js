export class GetMateriaByIdUseCase {
  constructor({ subjectRepository, logger }) {
    this.subjectRepository = subjectRepository;
    this.logger = logger;
  }

  async execute(id) {
    const materia = await this.subjectRepository.findById(id, { paranoid: false });
    return materia;
  }
}

