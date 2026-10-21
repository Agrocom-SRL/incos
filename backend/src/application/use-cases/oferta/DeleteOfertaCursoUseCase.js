import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';

export class DeleteOfertaCursoUseCase {
  constructor({ courseOfferRepository, logger }) {
    this.courseOfferRepository = courseOfferRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const offer = await this.courseOfferRepository.findById(id);
    if (!offer) throw new NotFoundError('oferta de curso');

    const matriculas = await this.courseOfferRepository.countActiveEnrollmentsByOfferId(id);
    if (matriculas > 0) {
      throw new ValidationError(
        'No se puede eliminar: existen matrículas activas asociadas a esta oferta'
      );
    }

    const { asignaciones, bloques } = await this.courseOfferRepository.countDependenciasByOfferId(id);
    if (asignaciones > 0 || bloques > 0) {
      throw new ValidationError(
        'No se puede eliminar: la oferta tiene asignaciones docentes o bloques de horario; retírelos primero',
        { asignaciones, bloques }
      );
    }

    await this.courseOfferRepository.delete(id, userId);
    return { eliminado: true, id };
  }
}
