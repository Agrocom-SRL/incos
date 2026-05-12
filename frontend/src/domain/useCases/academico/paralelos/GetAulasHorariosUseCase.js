import { IParaleloRepository } from '@repositories/IParaleloRepository';

export class GetAulasHorariosUseCase {
  constructor(paraleloRepository) {
    /** @type {IParaleloRepository} */
    this.paraleloRepository = paraleloRepository;
  }

  async ejecutar(params = {}) {
    return this.paraleloRepository.obtenerAulasHorarios({ params });
  }
}

