import { NotFoundError } from '../../../domain/errors/AppError.js';
import { BecaDescuentoMapper } from '../../mappers/estudiantes/index.js';

/**
 * Use Case: UpdateBecaDescuentoUseCase
 * Módulo: Estudiantes
 * Actualiza una beca o descuento existente (actualización parcial)
 */
export class UpdateBecaDescuentoUseCase {
  constructor({ scholarshipRepository, logger }) {
    this.scholarshipRepository = scholarshipRepository;
    this.logger = logger;
  }

  async execute(id, body = {}, userId = null) {
    const existing = await this.scholarshipRepository.findById(id);
    if (!existing) throw new NotFoundError('beca o descuento');

    const updated = await this.scholarshipRepository.update(
      id,
      {
        name: body.nombre ?? body.name ?? undefined,
        code: body.codigo ?? body.code ?? undefined,
        percentage: body.porcentaje ?? body.percentage ?? undefined,
        description: body.descripcion ?? body.description ?? undefined,
        requiresDocumentation: body.requiereDocumentacion ?? body.requiresDocumentation ?? undefined,
        requiresRectorApproval: body.requiereAprobacionRector ?? body.requiresRectorApproval ?? undefined,
        isAutomatic: body.esAutomatica ?? body.isAutomatic ?? undefined,
        automaticType: body.tipoAutomatica ?? body.automaticType ?? undefined,
        minimumAverage: body.promedioMinimo ?? body.minimumAverage ?? undefined,
        active: body.activo ?? body.active ?? undefined,
      },
      userId
    );

    this.logger.info('Beca o descuento actualizado', { id });
    return { becaDescuento: BecaDescuentoMapper.entityToPresentation(updated) };
  }
}
