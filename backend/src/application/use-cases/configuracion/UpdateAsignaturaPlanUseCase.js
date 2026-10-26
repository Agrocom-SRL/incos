import { NotFoundError } from '../../../domain/errors/AppError.js';
import {
  parseBooleanoOpcional,
  parseNumero,
  parseNumeroOpcional,
  parseTextoOpcional,
  primerDefinido,
} from '../../utils/validacionEntrada.js';

export class UpdateAsignaturaPlanUseCase {
  constructor({ planSubjectRepository, logger }) {
    this.planSubjectRepository = planSubjectRepository;
    this.logger = logger;
  }

  async execute(id, body = {}, userId = null) {
    const horas = primerDefinido(body, 'horas_semanales', 'horasSemanales') ?? undefined;
    const patch = {
      weeklyHours: horas === undefined ? undefined : parseNumero(horas, 'horas_semanales', { min: 1 }),
      // `null` vacía la modalidad; `undefined` no la toca.
      modality: parseTextoOpcional(primerDefinido(body, 'modalidad', 'modality'), 'modalidad'),
      displayOrder: parseNumeroOpcional(
        primerDefinido(body, 'orden_visualizacion', 'ordenVisualizacion') ?? undefined,
        'orden_visualizacion',
        { min: 0, entero: true }
      ),
      active: parseBooleanoOpcional(body.activo, 'activo'),
    };

    const existing = await this.planSubjectRepository.findById(id);
    if (!existing) throw new NotFoundError('asignatura_plan');

    const updated = await this.planSubjectRepository.update(id, patch, userId);
    return { asignatura: updated };
  }
}
