import { ClassroomMapper } from '../../mappers/configuracion/index.js';

function mapParaleloQueUsaAula(row) {
  return {
    paraleloId: row.paralelo_id,
    paraleloNombre: row.paralelo_nombre,
    materiaNombre: row.materia_nombre,
    carreraNombre: row.carrera_nombre,
    docenteNombre: row.docente_nombre,
  };
}

export class GetAulaByIdUseCase {
  constructor({ classroomRepository, aulasHorariosSemanaRepository, logger }) {
    this.classroomRepository = classroomRepository;
    this.aulasHorariosSemanaRepository = aulasHorariosSemanaRepository;
    this.logger = logger;
  }

  async execute(id) {
    const entity = await this.classroomRepository.findById(id, { paranoid: false });
    if (!entity) return null;

    const presentation = ClassroomMapper.entityToPresentation(entity);
    presentation.paralelosQueUsanAula = await this.buildParalelosQueUsanAula(id);
    return presentation;
  }

  async buildParalelosQueUsanAula(aulaId) {
    if (!this.aulasHorariosSemanaRepository) return [];

    try {
      const rows = await this.aulasHorariosSemanaRepository.findByAulaId(aulaId);
      const porParalelo = new Map();
      for (const row of rows) {
        if (row?.paralelo_id != null && !porParalelo.has(row.paralelo_id)) {
          porParalelo.set(row.paralelo_id, mapParaleloQueUsaAula(row));
        }
      }
      return Array.from(porParalelo.values());
    } catch (error) {
      this.logger?.error?.('Error al obtener paralelos que usan el aula', {
        aulaId,
        error: error?.message,
      });
      return [];
    }
  }
}
