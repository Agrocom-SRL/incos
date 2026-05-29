import { DOCENTE_COLOR_PALETTE } from '../../../domain/constants/docentes.constants.js';
import { DocenteColorMapper } from '../../mappers/docentes/DocenteColorMapper.js';

/**
 * Paleta institucional con indicador de disponibilidad por color.
 */
export class GetDocenteColoresSugeridosUseCase {
  constructor({ teacherRepository, logger }) {
    this.teacherRepository = teacherRepository;
    this.logger = logger;
  }

  async execute() {
    const rows = await this.teacherRepository.findActiveColorAssignments();
    const usedByColor = new Map();
    for (const row of rows) {
      if (!usedByColor.has(row.colorHex)) {
        usedByColor.set(row.colorHex, row);
      }
    }

    const coloresSugeridos = DocenteColorMapper.toColoresSugeridosPresentation(
      DOCENTE_COLOR_PALETTE,
      usedByColor
    );

    this.logger.info('Paleta de colores sugeridos consultada', {
      total: coloresSugeridos.length,
      disponibles: coloresSugeridos.filter((c) => c.disponible).length,
    });

    return { colores_sugeridos: coloresSugeridos };
  }
}
