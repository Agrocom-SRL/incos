import { NotFoundError } from '../../../domain/errors/AppError.js';
import { parseBooleanoOpcional, parseIdPositivo, parseTextoOpcional, primerDefinido } from '../../utils/validacionEntrada.js';
import { parsePlanEstudiosOpcionales } from './planEstudiosPayload.js';

export class UpdatePlanEstudiosUseCase {
  constructor({ studyPlanRepository, logger }) {
    this.studyPlanRepository = studyPlanRepository;
    this.logger = logger;
  }

  async execute(id, body = {}, userId = null) {
    const careerRaw = primerDefinido(body, 'carrera_id', 'carreraId') ?? undefined;
    const patch = {
      careerId: careerRaw === undefined ? undefined : parseIdPositivo(careerRaw, 'carrera_id'),
      planName: parseTextoOpcional(primerDefinido(body, 'nombre_plan', 'nombrePlan') ?? undefined, 'nombre_plan', {
        requerido: true,
      }),
      ...parsePlanEstudiosOpcionales(body),
      active: parseBooleanoOpcional(body.activo, 'activo'),
    };

    const existing = await this.studyPlanRepository.findById(id);
    if (!existing) throw new NotFoundError('plan de estudios');

    const updated = await this.studyPlanRepository.update(id, patch, userId);
    this.logger.info('Plan de estudios actualizado', { id });
    return { plan_estudio: updated };
  }
}
