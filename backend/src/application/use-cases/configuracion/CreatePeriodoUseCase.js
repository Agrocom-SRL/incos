import { ValidationError } from '../../../domain/errors/AppError.js';
import {
  parseBooleanoOpcional,
  parseNumero,
  parseTextoOpcional,
  primerDefinido,
} from '../../utils/validacionEntrada.js';

export class CreatePeriodoUseCase {
  constructor({ periodRepository, logger }) {
    this.periodRepository = periodRepository;
    this.logger = logger;
  }

  async execute(planEstudioId, body = {}, userId = null) {
    const nombre = parseTextoOpcional(body.nombre, 'nombre', { requerido: true });
    if (nombre === undefined) throw new ValidationError('nombre es requerido');
    if (body.numero === undefined || body.numero === null) throw new ValidationError('numero es requerido');
    const numero = parseNumero(body.numero, 'numero', { min: 1, entero: true });
    const orden = primerDefinido(body, 'orden_visualizacion', 'ordenVisualizacion');

    const created = await this.periodRepository.create(
      {
        studyPlanId: planEstudioId,
        name: nombre,
        number: numero,
        displayOrder: orden == null ? numero : parseNumero(orden, 'orden_visualizacion', { min: 0, entero: true }),
        description: parseTextoOpcional(body.descripcion, 'descripcion') ?? undefined,
        active: parseBooleanoOpcional(body.activo, 'activo') ?? true,
      },
      userId
    );
    return { periodo: created };
  }
}
