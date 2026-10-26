import { NotFoundError } from '../../../domain/errors/AppError.js';
import {
  parseBooleanoOpcional,
  parseNumeroOpcional,
  parseTextoOpcional,
  primerDefinido,
} from '../../utils/validacionEntrada.js';

export class UpdatePeriodoUseCase {
  constructor({ periodRepository, logger }) {
    this.periodRepository = periodRepository;
    this.logger = logger;
  }

  async execute(id, body = {}, userId = null) {
    const patch = {
      name: parseTextoOpcional(body.nombre ?? undefined, 'nombre', { requerido: true }),
      number: parseNumeroOpcional(body.numero ?? undefined, 'numero', { min: 1, entero: true }),
      displayOrder: parseNumeroOpcional(
        primerDefinido(body, 'orden_visualizacion', 'ordenVisualizacion') ?? undefined,
        'orden_visualizacion',
        { min: 0, entero: true }
      ),
      description: parseTextoOpcional(body.descripcion, 'descripcion'),
      active: parseBooleanoOpcional(body.activo, 'activo'),
    };

    const existing = await this.periodRepository.findById(id);
    if (!existing) throw new NotFoundError('periodo');

    const updated = await this.periodRepository.update(id, patch, userId);
    return { periodo: updated };
  }
}
