import { NotFoundError } from '../../../domain/errors/AppError.js';
import {
  CareerMapper,
  StudyPlanMapper,
  PeriodMapper,
  PlanSubjectMapper,
  SubjectMapper,
} from '../../mappers/configuracion/index.js';

export class GetPlanEstudiosMatrizUseCase {
  constructor({ studyPlanRepository, careerRepository, periodRepository, planSubjectRepository, subjectRepository, logger }) {
    this.studyPlanRepository = studyPlanRepository;
    this.careerRepository = careerRepository;
    this.periodRepository = periodRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.subjectRepository = subjectRepository;
    this.logger = logger;
  }

  async execute(planEstudioId) {
    const planEntity = await this.studyPlanRepository.findById(planEstudioId);
    if (!planEntity) throw new NotFoundError('plan de estudios');

    const carreraEntity = planEntity.careerId ? await this.careerRepository.findById(planEntity.careerId) : null;

    const periodosResult = await this.periodRepository.findAll(
      { studyPlanId: planEstudioId, sort: 'numero:ASC' },
      null,
      null
    );
    const asignaturasResult = await this.planSubjectRepository.findAll(
      { studyPlanId: planEstudioId, sort: 'periodoId:ASC' },
      null,
      null
    );

    const periodos = PeriodMapper.entitiesToPresentation(periodosResult.periods ?? []);
    const asignaturasPlan = PlanSubjectMapper.entitiesToPresentation(asignaturasResult.planSubjects ?? []);

    const materiaIds = [...new Set(asignaturasPlan.map((a) => a.materia_id).filter(Boolean))];
    const materiasMap = new Map();
    if (materiaIds.length > 0) {
      const materiasResult = await this.subjectRepository.findAll({ id: materiaIds }, null, null);
      const materias = SubjectMapper.entitiesToPresentation(materiasResult.subjects ?? []);
      for (const m of materias) materiasMap.set(m.id, m);
    }

    const periodosById = new Map();
    for (const p of periodos) {
      periodosById.set(p.id, {
        id: p.id,
        nombre: p.nombre,
        numero: p.numero,
        asignaturas: [],
        horas_total: 0,
      });
    }

    for (const ap of asignaturasPlan) {
      const bucket = periodosById.get(ap.periodo_id);
      if (!bucket) continue;
      const materia = materiasMap.get(ap.materia_id) ?? { id: ap.materia_id, sigla: null, nombre: null, tipo: null };
      const item = {
        id: ap.id,
        materia: {
          sigla: materia.sigla ?? null,
          nombre: materia.nombre ?? null,
          tipo: materia.tipo ?? null,
        },
        horas_semanales: ap.horas_semanales,
        modalidad: ap.modalidad,
        orden_visualizacion: ap.orden_visualizacion,
      };
      bucket.asignaturas.push(item);
      bucket.horas_total += Number(ap.horas_semanales ?? 0) || 0;
    }

    // Ordenar asignaturas dentro de cada periodo por orden_visualizacion (y fallback id)
    for (const p of periodosById.values()) {
      p.asignaturas.sort((a, b) => {
        const oa = Number(a.orden_visualizacion ?? 0) || 0;
        const ob = Number(b.orden_visualizacion ?? 0) || 0;
        if (oa !== ob) return oa - ob;
        return (a.id ?? 0) - (b.id ?? 0);
      });
    }

    const periodosOut = periodos.map((p) => periodosById.get(p.id)).filter(Boolean);
    const horasTotalPlan = periodosOut.reduce((acc, p) => acc + (Number(p.horas_total ?? 0) || 0), 0);

    const plan = StudyPlanMapper.entityToPresentation(planEntity);
    const carrera = carreraEntity ? CareerMapper.entityToPresentation(carreraEntity) : null;

    return {
      plan: {
        id: plan.id,
        nombre_plan: plan.nombre_plan ?? null,
        horas_semana: plan.horas_semana ?? null,
        carrera,
      },
      periodos: periodosOut,
      horas_total_plan: horasTotalPlan,
    };
  }
}
