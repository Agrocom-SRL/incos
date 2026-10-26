import { ValidationError } from '../../../domain/errors/AppError.js';
import { parseBooleanoOpcional, parseIdPositivo, parseTextoOpcional, primerDefinido } from '../../utils/validacionEntrada.js';
import { parsePlanEstudiosOpcionales } from './planEstudiosPayload.js';

export class CreatePlanEstudiosUseCase {
  constructor({ studyPlanRepository, logger }) {
    this.studyPlanRepository = studyPlanRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    const careerRaw = primerDefinido(body, 'carrera_id', 'carreraId', 'careerId');
    if (careerRaw === undefined || careerRaw === null || careerRaw === '') {
      throw new ValidationError('carrera_id es requerido');
    }
    const careerId = parseIdPositivo(careerRaw, 'carrera_id');
    const planName = parseTextoOpcional(primerDefinido(body, 'nombre_plan', 'nombrePlan', 'planName'), 'nombre_plan', {
      requerido: true,
    });
    if (planName === undefined) throw new ValidationError('nombre_plan es requerido');

    const opcionales = parsePlanEstudiosOpcionales(body);
    const created = await this.studyPlanRepository.create(
      {
        careerId,
        planName,
        ministerialResolution: opcionales.ministerialResolution ?? undefined,
        documentPath: opcionales.documentPath ?? undefined,
        durationYears: opcionales.durationYears ?? undefined,
        totalHours: opcionales.totalHours ?? undefined,
        hoursPerWeek: opcionales.hoursPerWeek ?? undefined,
        hoursPerMonth: opcionales.hoursPerMonth ?? undefined,
        hoursPerYear: opcionales.hoursPerYear ?? undefined,
        observations: opcionales.observations ?? undefined,
        isActive: opcionales.isActive,
        active: parseBooleanoOpcional(body.activo, 'activo') ?? true,
      },
      userId
    );
    this.logger.info('Plan de estudios creado', { id: created.id });
    return { plan_estudio: created };
  }
}
