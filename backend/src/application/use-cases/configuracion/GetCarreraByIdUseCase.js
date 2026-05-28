import { CareerMapper } from '../../mappers/configuracion/index.js';

export class GetCarreraByIdUseCase {
  constructor({ careerRepository, logger }) {
    this.careerRepository = careerRepository;
    this.logger = logger;
  }

  async execute(id) {
    const carreraEntity = await this.careerRepository.findById(id, { paranoid: false });
    if (!carreraEntity) return null;

    const carrera = CareerMapper.entityToPresentation(carreraEntity);
    const rows = await this.careerRepository.findAsignaturasMatrizByCarreraId(id);

    const periodosMap = new Map();
    for (const row of rows ?? []) {
      const periodoKey = row.periodo_id ?? `plan-${row.plan_estudio_id}-sin-periodo`;
      if (!periodosMap.has(periodoKey)) {
        periodosMap.set(periodoKey, {
          periodo_id: row.periodo_id,
          periodo_nombre: row.periodo_nombre,
          periodo_numero: row.periodo_numero,
          materias: [],
        });
      }
      periodosMap.get(periodoKey).materias.push({
        asignatura_plan_id: row.asignatura_plan_id,
        materia_id: row.materia_id,
        materia_sigla: row.materia_sigla,
        materia_nombre: row.materia_nombre,
        materia_tipo: row.materia_tipo,
        materia_clasificacion: row.materia_clasificacion,
        plan_estudio_id: row.plan_estudio_id,
        plan_nombre: row.nombre_plan,
        plan_vigente: Boolean(row.plan_vigente),
        horas_semanales: row.horas_semanales,
        creditos: row.creditos,
        modalidad: row.modalidad,
        cantidad_prerrequisitos: Number(row.cantidad_prerrequisitos) || 0,
        tiene_prerrequisitos: Number(row.cantidad_prerrequisitos) > 0,
      });
    }

    const periodos = [...periodosMap.values()].sort(
      (a, b) => (Number(a.periodo_numero) || 0) - (Number(b.periodo_numero) || 0),
    );

    return { carrera, periodos };
  }
}
