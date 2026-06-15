import { ValidationError } from '../../../domain/errors/AppError.js';

export class CreatePlanEstudiosUseCase {
  constructor({ studyPlanRepository, logger }) {
    this.studyPlanRepository = studyPlanRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    const careerId = body.carrera_id ?? body.carreraId ?? body.careerId ?? null;
    const planName = body.nombre_plan ?? body.nombrePlan ?? body.planName ?? null;
    if (!careerId) throw new ValidationError('carrera_id es requerido');
    if (!planName) throw new ValidationError('nombre_plan es requerido');

    const created = await this.studyPlanRepository.create(
      {
        careerId,
        planName,
        ministerialResolution: body.resolucion_ministerial ?? body.resolucionMinisterial ?? undefined,
        documentPath: body.documento_ruta ?? body.documentoRuta ?? undefined,
        durationYears: body.duracion_anios ?? body.duracionAnios ?? undefined,
        totalHours: body.carga_horaria_total ?? body.cargaHorariaTotal ?? undefined,
        hoursPerWeek: body.horas_semana ?? body.horasSemana ?? undefined,
        hoursPerMonth: body.horas_mes ?? body.horasMes ?? undefined,
        hoursPerYear: body.horas_anio ?? body.horasAnio ?? undefined,
        observations: body.observaciones ?? undefined,
        isActive: body.vigente ?? body.isActive ?? undefined,
        active: body.activo ?? true,
      },
      userId
    );
    this.logger.info('Plan de estudios creado', { id: created.id });
    return { plan_estudio: created };
  }
}

