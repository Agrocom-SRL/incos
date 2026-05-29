import { DocenteColorMapper } from '../../mappers/docentes/DocenteColorMapper.js';

/**
 * Lista colores hex ya asignados a docentes activos.
 */
export class GetDocenteColoresEnUsoUseCase {
  constructor({ teacherRepository, logger }) {
    this.teacherRepository = teacherRepository;
    this.logger = logger;
  }

  async execute() {
    const rows = await this.teacherRepository.findActiveColorAssignments();
    const coloresEnUso = DocenteColorMapper.toColorEnUsoPresentation(rows);

    this.logger.info('Colores de docentes en uso consultados', { total: coloresEnUso.length });

    return { colores_en_uso: coloresEnUso };
  }
}
