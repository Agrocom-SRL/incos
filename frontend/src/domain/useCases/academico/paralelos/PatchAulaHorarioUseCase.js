import { IParaleloRepository } from '@repositories/IParaleloRepository';

export class PatchAulaHorarioUseCase {
  constructor(paraleloRepository) {
    /** @type {IParaleloRepository} */
    this.paraleloRepository = paraleloRepository;
  }

  async ejecutar(cursoHorarioId, aulaId) {
    return this.paraleloRepository.asignarAulaHorario({ cursoHorarioId, aulaId });
  }
}

