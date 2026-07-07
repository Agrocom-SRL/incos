import { BecaDescuentoMapper } from '../../mappers/estudiantes/index.js';

/**
 * Use Case: GetBecaDescuentoByIdUseCase
 * Módulo: Estudiantes
 * Obtiene una beca o descuento por ID (incluye registros inactivos/eliminados
 * vía paranoid: false, igual que GetDiscapacidadByIdUseCase)
 */
export class GetBecaDescuentoByIdUseCase {
  constructor({ scholarshipRepository, logger }) {
    this.scholarshipRepository = scholarshipRepository;
    this.logger = logger;
  }

  async execute(id) {
    const entity = await this.scholarshipRepository.findById(id, { paranoid: false });
    if (!entity) return null;

    return BecaDescuentoMapper.entityToPresentation(entity);
  }
}
