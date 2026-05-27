import { NotFoundError } from '../../../domain/errors/AppError.js';

/**
 * Valida coherencia horaria del plan: por cada periodo,
 * SUM(asignaturas_plan.horas_semanales) debe coincidir con planes_estudios.horas_semana.
 */
export class ValidarPlanEstudiosUseCase {
  constructor({ studyPlanRepository, periodRepository, planSubjectRepository, logger }) {
    this.studyPlanRepository = studyPlanRepository;
    this.periodRepository = periodRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.logger = logger;
  }

  async execute(planEstudioId) {
    const planEntity = await this.studyPlanRepository.findById(planEstudioId);
    if (!planEntity) throw new NotFoundError('plan de estudios');

    const horasEsperadasPorPeriodo = Number(planEntity.hoursPerWeek ?? 0) || 0;

    const periodosResult = await this.periodRepository.findAll(
      { studyPlanId: planEstudioId, sort: 'numero:ASC' },
      null,
      null
    );
    const asignaturasResult = await this.planSubjectRepository.findAll(
      { studyPlanId: planEstudioId },
      null,
      null
    );

    const periodos = periodosResult.periods ?? [];
    const asignaturasPlan = asignaturasResult.planSubjects ?? [];

    const horasPorPeriodo = new Map();
    const materiasCountPorPeriodo = new Map();

    for (const p of periodos) {
      horasPorPeriodo.set(p.id, 0);
      materiasCountPorPeriodo.set(p.id, 0);
    }

    for (const ap of asignaturasPlan) {
      const periodoId = ap.periodId;
      if (!horasPorPeriodo.has(periodoId)) continue;
      horasPorPeriodo.set(periodoId, (horasPorPeriodo.get(periodoId) ?? 0) + (Number(ap.weeklyHours ?? 0) || 0));
      materiasCountPorPeriodo.set(periodoId, (materiasCountPorPeriodo.get(periodoId) ?? 0) + 1);
    }

    const periodosOut = periodos.map((p) => {
      const horasAsignadas = horasPorPeriodo.get(p.id) ?? 0;
      const ok = horasAsignadas === horasEsperadasPorPeriodo;
      return {
        periodo_id: p.id,
        horas_esperadas: horasEsperadasPorPeriodo,
        horas_asignadas: horasAsignadas,
        materias_count: materiasCountPorPeriodo.get(p.id) ?? 0,
        ok,
      };
    });

    const totalAsignado = periodosOut.reduce((acc, row) => acc + row.horas_asignadas, 0);
    const totalEsperado = horasEsperadasPorPeriodo * periodos.length;
    const valido = periodosOut.length > 0 && periodosOut.every((row) => row.ok);

    return {
      valido,
      periodos: periodosOut,
      total_horas: {
        esperado: totalEsperado,
        asignado: totalAsignado,
      },
    };
  }
}
