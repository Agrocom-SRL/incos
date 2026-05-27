export class GetCarreraByIdUseCase {
  constructor({ careerRepository, logger }) {
    this.careerRepository = careerRepository;
    this.logger = logger;
  }

  async execute(id) {
    const carrera = await this.careerRepository.findById(id, { paranoid: false });
    return carrera;
  }
}

