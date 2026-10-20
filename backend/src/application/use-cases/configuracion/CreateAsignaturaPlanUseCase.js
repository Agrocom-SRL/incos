import { ValidationError } from '../../../domain/errors/AppError.js';

export class CreateAsignaturaPlanUseCase {
  constructor({ planSubjectRepository, logger }) {
    this.planSubjectRepository = planSubjectRepository;
    this.logger = logger;
  }

  async execute(body = {}, userId = null) {
    const planEstudioId = body.plan_estudio_id ?? body.planEstudioId ?? null;
    const periodoId = body.periodo_id ?? body.periodoId ?? null;
    const materiaId = body.materia_id ?? body.materiaId ?? null;
    const horas = body.horas_semanales ?? body.horasSemanales ?? null;
    if (!planEstudioId) throw new ValidationError('plan_estudio_id es requerido');
    if (!periodoId) throw new ValidationError('periodo_id es requerido');
    if (!materiaId) throw new ValidationError('materia_id es requerido');
    if (!horas) throw new ValidationError('horas_semanales es requerido');

    const created = await this.planSubjectRepository.create(
      {
        studyPlanId: planEstudioId,
        periodId: periodoId,
        subjectId: materiaId,
        weeklyHours: horas,
        modality: body.modalidad ?? body.modality ?? undefined,
        displayOrder: body.orden_visualizacion ?? body.ordenVisualizacion ?? undefined,
        active: body.activo ?? true,
      },
      userId
    );
    return { asignatura: created };
  }
}
