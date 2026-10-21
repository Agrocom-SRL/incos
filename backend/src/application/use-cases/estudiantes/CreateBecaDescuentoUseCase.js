import { ValidationError } from '../../../domain/errors/AppError.js';
import { parseNumero } from '../../utils/validacionEntrada.js';
import { BecaDescuentoMapper } from '../../mappers/estudiantes/index.js';

/**
 * Use Case: CreateBecaDescuentoUseCase
 * Módulo: Estudiantes
 * Crea una nueva beca o descuento en el catálogo maestro (becas_descuentos)
 */
export class CreateBecaDescuentoUseCase {
  constructor({ scholarshipRepository, logger }) {
    this.scholarshipRepository = scholarshipRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    const nombre = body.nombre ?? body.name ?? null;
    if (!nombre) throw new ValidationError('nombre es requerido');

    const porcentaje = body.porcentaje ?? body.percentage;
    if (porcentaje === undefined || porcentaje === null) {
      throw new ValidationError('porcentaje es requerido');
    }

    const porcentajeValido = parseNumero(porcentaje, 'porcentaje', { min: 0, max: 100 });

    const created = await this.scholarshipRepository.create(
      {
        name: nombre,
        code: body.codigo ?? body.code ?? undefined,
        percentage: porcentajeValido,
        description: body.descripcion ?? body.description ?? undefined,
        requiresDocumentation: body.requiereDocumentacion ?? body.requiresDocumentation ?? undefined,
        requiresRectorApproval: body.requiereAprobacionRector ?? body.requiresRectorApproval ?? undefined,
        isAutomatic: body.esAutomatica ?? body.isAutomatic ?? undefined,
        automaticType: body.tipoAutomatica ?? body.automaticType ?? undefined,
        minimumAverage: body.promedioMinimo ?? body.minimumAverage ?? undefined,
        active: body.activo ?? body.active ?? true,
      },
      userId
    );

    this.logger.info('Beca o descuento creado', { id: created.id });
    return { becaDescuento: BecaDescuentoMapper.entityToPresentation(created) };
  }
}
