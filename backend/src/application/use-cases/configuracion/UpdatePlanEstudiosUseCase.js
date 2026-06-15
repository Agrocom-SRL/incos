import { NotFoundError } from '../../../domain/errors/AppError.js';

export class UpdatePlanEstudiosUseCase {
  constructor({ studyPlanRepository, logger }) {
    this.studyPlanRepository = studyPlanRepository;
    this.logger = logger;
  }

  async execute(id, body = {}, userId = null) {
    const existing = await this.studyPlanRepository.findById(id);
    if (!existing) throw new NotFoundError('plan de estudios');

    const updated = await this.studyPlanRepository.update(
      id,
      {
        careerId: body.carrera_id ?? body.carreraId ?? undefined,
        planName: body.nombre_plan ?? body.nombrePlan ?? undefined,
        ministerialResolution: body.resolucion_ministerial ?? body.resolucionMinisterial ?? undefined,
        documentPath: body.documento_ruta ?? body.documentoRuta ?? undefined,
        durationYears: body.duracion_anios ?? body.duracionAnios ?? undefined,
        totalHours: body.carga_horaria_total ?? body.cargaHorariaTotal ?? undefined,
        hoursPerWeek: body.horas_semana ?? body.horasSemana ?? undefined,
        hoursPerMonth: body.horas_mes ?? body.horasMes ?? undefined,
        hoursPerYear: body.horas_anio ?? body.horasAnio ?? undefined,
        observations: body.observaciones ?? undefined,
        isActive: body.vigente ?? body.isActive ?? undefined,
        active: body.activo ?? undefined,
      },
      userId
    );
    this.logger.info('Plan de estudios actualizado', { id });
    return { plan_estudio: updated };
  }
}

