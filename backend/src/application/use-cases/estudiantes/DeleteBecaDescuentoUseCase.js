import { NotFoundError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: DeleteBecaDescuentoUseCase
 * Módulo: Estudiantes
 * Elimina (soft delete) una beca o descuento del catálogo maestro
 */
export class DeleteBecaDescuentoUseCase {
  constructor({ scholarshipRepository, logger }) {
    this.scholarshipRepository = scholarshipRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const ok = await this.scholarshipRepository.delete(id, userId);
    if (!ok) throw new NotFoundError('beca o descuento');
    this.logger.info('Beca o descuento eliminado', { id });
    return true;
  }
}
