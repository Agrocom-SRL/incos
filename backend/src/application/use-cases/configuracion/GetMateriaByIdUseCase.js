import { SubjectMapper } from '../../mappers/configuracion/index.js';

export class GetMateriaByIdUseCase {
  constructor({ subjectRepository, logger }) {
    this.subjectRepository = subjectRepository;
    this.logger = logger;
  }

  async execute(id) {
    const materiaEntity = await this.subjectRepository.findById(id, { paranoid: false });
    if (!materiaEntity) return null;

    const materia = SubjectMapper.entityToPresentation(materiaEntity);
    const rows = await this.subjectRepository.findAsignaturasMatrizByMateriaId(id);

    const asignaturas = (rows ?? []).map((row) => ({
      asignatura_plan_id: row.asignatura_plan_id,
      plan_estudio_id: row.plan_estudio_id,
      plan_nombre: row.nombre_plan ?? null,
      plan_vigente: Boolean(row.plan_vigente),
      carrera_id: row.carrera_id ?? null,
      carrera_codigo: row.carrera_codigo ?? null,
      carrera_nombre: row.carrera_nombre ?? null,
      carrera_color_hex: row.carrera_color_hex ?? null,
      periodo_id: row.periodo_id,
      periodo_nombre: row.periodo_nombre ?? null,
      periodo_numero: row.periodo_numero ?? null,
      horas_semanales: row.horas_semanales,
      creditos: row.creditos,
      modalidad: row.modalidad,
      orden_visualizacion: row.orden_visualizacion,
      cantidad_prerrequisitos: Number(row.cantidad_prerrequisitos) || 0,
      tiene_prerrequisitos: Number(row.cantidad_prerrequisitos) > 0,
    }));

    return { materia, asignaturas };
  }
}
