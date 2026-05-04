/**
 * Actualiza metadatos de un curso (oferta): código, color, cupos.
 * Opcionalmente valida que el curso pertenezca al paralelo enviado.
 */
import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { Course } from '../../../domain/entities/Course.js';

function mapCursoPayload(entity, { bloquesCount, tieneHorarios, asignaturaPlanId }) {
  const plain = typeof entity.toPlainObject === 'function' ? entity.toPlainObject() : entity;
  return {
    cursoId: entity.id,
    codigo: plain.code ?? null,
    cupoMaximo: plain.maxCapacity ?? null,
    cupoMinimo: plain.minCapacity ?? null,
    colorHex: plain.colorHex ?? null,
    asignaturaPlanId: asignaturaPlanId ?? plain.planSubjectId ?? null,
    materiaId: null,
    materiaNombre: null,
    materiaSigla: null,
    horasSemanalesPlan: null,
    bloquesCount,
    tieneHorarios,
  };
}

export class UpdateCursoOfertaUseCase {
  constructor({
    courseRepository,
    courseScheduleRepository,
    planSubjectRepository,
    subjectRepository,
    logger,
  }) {
    this.courseRepository = courseRepository;
    this.courseScheduleRepository = courseScheduleRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.subjectRepository = subjectRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} input
   * @param {number} input.courseId
   * @param {number} [input.parallelId] — si se envía, debe coincidir con el curso
   * @param {string} [input.codigo]
   * @param {number} [input.cupoMaximo]
   * @param {number} [input.cupoMinimo]
   * @param {string} [input.colorHex]
   * @param {number|null} userId
   */
  async execute(input, userId = null) {
    const courseId = Number(input?.courseId);
    this.logger.info('[Académico] Actualizar curso (oferta)', { courseId });

    if (!Number.isFinite(courseId) || courseId < 1) {
      throw new ValidationError('ID de curso inválido');
    }

    const curso = await this.courseRepository.findById(courseId);
    if (!curso) {
      throw new NotFoundError('curso');
    }

    if (input.parallelId != null && Number(curso.parallelId) !== Number(input.parallelId)) {
      throw new ValidationError('El curso no pertenece al paralelo indicado');
    }

    const update = {};
    if (input.codigo !== undefined) {
      const c = String(input.codigo ?? '').trim();
      if (!c) {
        throw new ValidationError('codigo no puede quedar vacío');
      }
      if (c.length > 50) {
        throw new ValidationError('codigo admite como máximo 50 caracteres');
      }
      update.code = c;
    }
    if (input.colorHex !== undefined) {
      const h = String(input.colorHex ?? '').trim();
      if (h && !/^#[0-9A-Fa-f]{6}$/.test(h)) {
        throw new ValidationError('colorHex debe ser #RRGGBB (6 hex)');
      }
      update.colorHex = h || null;
    }
    if (input.cupoMaximo !== undefined) {
      const n = Number(input.cupoMaximo);
      if (!Number.isFinite(n) || n < 1 || n > 500) {
        throw new ValidationError('cupoMaximo debe ser entero entre 1 y 500');
      }
      update.maxCapacity = n;
    }
    if (input.cupoMinimo !== undefined) {
      const n = Number(input.cupoMinimo);
      if (!Number.isFinite(n) || n < 0 || n > 500) {
        throw new ValidationError('cupoMinimo debe ser entero entre 0 y 500');
      }
      update.minCapacity = n;
    }

    if (Object.keys(update).length === 0) {
      throw new ValidationError('No hay campos para actualizar');
    }

    const maxCap = update.maxCapacity !== undefined ? update.maxCapacity : (curso.maxCapacity ?? 35);
    const minCap = update.minCapacity !== undefined ? update.minCapacity : (curso.minCapacity ?? 10);
    const merged = new Course({
      code: update.code !== undefined ? update.code : curso.code,
      parallelId: curso.parallelId,
      planSubjectId: curso.planSubjectId,
      maxCapacity: maxCap,
      minCapacity: minCap,
      colorHex: update.colorHex !== undefined ? update.colorHex : curso.colorHex,
    });
    if (!merged.isValidCapacity()) {
      throw new ValidationError('cupoMaximo debe ser mayor o igual a cupoMinimo');
    }

    const updated = await this.courseRepository.update(courseId, update, userId);
    let bloquesCount = 0;
    try {
      bloquesCount = await this.courseScheduleRepository.count({ courseId });
    } catch (e) {
      this.logger.warn('[Académico] No se pudo contar bloques tras actualizar curso', { courseId, error: e.message });
    }

    const asignaturaPlanId = updated.planSubjectId ?? curso.planSubjectId;
    let horasSemanalesPlan = null;
    let materiaNombre = null;
    let materiaSigla = null;
    let materiaId = null;
    if (asignaturaPlanId) {
      try {
        const ps = await this.planSubjectRepository.findById(asignaturaPlanId);
        horasSemanalesPlan = ps?.weeklyHours ?? null;
        if (ps?.subjectId) {
          const materia = await this.subjectRepository.findById(ps.subjectId);
          materiaId = materia?.id ?? null;
          materiaNombre = materia?.name ?? null;
          materiaSigla = materia?.acronym ?? null;
        }
      } catch (e) {
        this.logger.warn('[Académico] No se pudo enriquecer curso actualizado', { error: e.message });
      }
    }

    const base = mapCursoPayload(updated, {
      bloquesCount,
      tieneHorarios: bloquesCount > 0,
      asignaturaPlanId,
    });
    return {
      curso: {
        ...base,
        horasSemanalesPlan,
        materiaId,
        materiaNombre,
        materiaSigla,
      },
    };
  }
}
