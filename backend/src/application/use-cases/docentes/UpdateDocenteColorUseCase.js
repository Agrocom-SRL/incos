import { NotFoundError, UnprocessableEntityError, ValidationError } from '../../../domain/errors/AppError.js';
import { DOCENTE_COLOR_HEX_REGEX } from '../../../domain/constants/docentes.constants.js';
import {
  DocenteColorMapper,
  normalizeDocenteColorHex,
} from '../../mappers/docentes/DocenteColorMapper.js';

/**
 * Asigna o actualiza el color único del docente para horarios.
 */
export class UpdateDocenteColorUseCase {
  constructor({ teacherRepository, logger }) {
    this.teacherRepository = teacherRepository;
    this.logger = logger;
  }

  /**
   * @param {{ docenteId: number, colorHex: string }} params
   * @param {number|null} userId
   */
  async execute({ docenteId, colorHex }, userId = null) {
    const teacherId = Number(docenteId);
    if (!Number.isFinite(teacherId) || teacherId < 1) {
      throw new ValidationError('docenteId inválido');
    }

    const normalized = normalizeDocenteColorHex(colorHex);
    if (!normalized || !DOCENTE_COLOR_HEX_REGEX.test(normalized)) {
      throw new UnprocessableEntityError('color_hex debe tener formato #RRGGBB.', [
        { field: 'color_hex', message: 'Formato inválido' },
      ]);
    }

    const existing = await this.teacherRepository.findById(teacherId);
    if (!existing) {
      throw new NotFoundError(`Docente con ID ${teacherId}`);
    }

    const conflict = await this.teacherRepository.findActiveByColorHex(normalized, teacherId);
    if (conflict) {
      const inUse = await this.teacherRepository.findActiveColorAssignments();
      throw new UnprocessableEntityError(
        'El color ya está en uso por otro docente activo.',
        [{ field: 'color_hex', message: 'Color no disponible' }],
        { colores_en_uso: DocenteColorMapper.toColorEnUsoPresentation(inUse) }
      );
    }

    const updated = await this.teacherRepository.update(teacherId, { colorHex: normalized }, userId);
    const presentation = DocenteColorMapper.toDocenteColorPresentation(updated);

    this.logger.info('Color de docente actualizado', {
      docenteId: teacherId,
      colorHex: presentation.color_hex,
    });

    return presentation;
  }
}
