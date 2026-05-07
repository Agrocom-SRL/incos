/**
 * Alta de curso en la oferta del paralelo (tabla `cursos`).
 * Valida coherencia con `asignaturas_plan` y `paralelos` según schema académico.
 */
import { ConflictError, NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { Course } from '../../../domain/entities/Course.js';

function tightSegment(raw, maxLen) {
  const s = String(raw ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toUpperCase();
  return (s || 'X').slice(0, maxLen);
}

function deriveColorHex(parallelId, planSubjectId) {
  const a = Number(parallelId) >>> 0;
  const b = Number(planSubjectId) >>> 0;
  const seed = Math.imul(a, 2654435761) ^ Math.imul(b, 1597334677);
  const r = (seed & 0xff0000) >> 16;
  const g = (seed & 0xff00) >> 8;
  const x = seed & 0xff;
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(x)}`;
}

export class CreateParaleloCursoOfertaUseCase {
  constructor({
    parallelRepository,
    courseRepository,
    planSubjectRepository,
    studyPlanRepository,
    subjectRepository,
    careerRepository,
    logger,
  }) {
    this.parallelRepository = parallelRepository;
    this.courseRepository = courseRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.studyPlanRepository = studyPlanRepository;
    this.subjectRepository = subjectRepository;
    this.careerRepository = careerRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} input
   * @param {number} input.parallelId
   * @param {number} input.asignaturaPlanId
   * @param {string} [input.codigo]
   * @param {number} [input.cupoMaximo]
   * @param {number} [input.cupoMinimo]
   * @param {string} [input.colorHex]
   * @param {number|null} userId
   */
  async execute(input, userId = null) {
    const parallelId = Number(input?.parallelId);
    const asignaturaPlanId = Number(input?.asignaturaPlanId);

    this.logger.info('[Académico] Crear curso en oferta del paralelo', { parallelId, asignaturaPlanId });

    if (!Number.isFinite(parallelId) || parallelId < 1) {
      throw new ValidationError('ID de paralelo inválido');
    }
    if (!Number.isFinite(asignaturaPlanId) || asignaturaPlanId < 1) {
      throw new ValidationError('asignaturaPlanId es requerido y debe ser un entero mayor a cero');
    }

    const paralelo = await this.parallelRepository.findById(parallelId);
    if (!paralelo) {
      throw new NotFoundError('paralelo');
    }

    const planSubject = await this.planSubjectRepository.findById(asignaturaPlanId);
    if (!planSubject) {
      throw new NotFoundError('asignatura del plan');
    }

    if (paralelo.periodId == null) {
      throw new ValidationError('El paralelo debe tener un periodo (año del plan) asignado para crear cursos');
    }
    if (planSubject.periodId == null || Number(planSubject.periodId) !== Number(paralelo.periodId)) {
      throw new ValidationError(
        'La asignatura del plan no pertenece al mismo periodo académico que el paralelo',
      );
    }

    if (planSubject.studyPlanId) {
      const plan = await this.studyPlanRepository.findById(planSubject.studyPlanId);
      if (!plan) {
        throw new ValidationError('Plan de estudios de la asignatura no encontrado');
      }
      const planCareerId = plan.careerId;
      if (paralelo.careerId != null && planCareerId != null && Number(planCareerId) !== Number(paralelo.careerId)) {
        throw new ValidationError('La asignatura del plan no pertenece a la misma carrera que el paralelo');
      }
    } else if (paralelo.careerId != null) {
      throw new ValidationError('La asignatura del plan no tiene plan de estudios asociado');
    }

    const existing = await this.courseRepository.findBy({
      parallelId,
      planSubjectId: asignaturaPlanId,
    });
    if (existing) {
      throw new ConflictError('Ya existe un curso activo para esta asignatura en el paralelo');
    }

    const maxCap = input.cupoMaximo !== undefined && input.cupoMaximo !== null ? Number(input.cupoMaximo) : 35;
    const minCap = input.cupoMinimo !== undefined && input.cupoMinimo !== null ? Number(input.cupoMinimo) : 10;
    if (!Number.isFinite(maxCap) || maxCap < 1 || maxCap > 500) {
      throw new ValidationError('cupoMaximo debe ser un entero entre 1 y 500');
    }
    if (!Number.isFinite(minCap) || minCap < 0 || minCap > maxCap) {
      throw new ValidationError('cupoMinimo debe ser un entero entre 0 y cupoMaximo');
    }

    let colorHex = typeof input.colorHex === 'string' ? input.colorHex.trim() : '';
    if (colorHex && !/^#[0-9A-Fa-f]{6}$/.test(colorHex)) {
      throw new ValidationError('colorHex debe ser un hexadecimal de 7 caracteres (#RRGGBB)');
    }
    if (!colorHex) {
      colorHex = deriveColorHex(parallelId, asignaturaPlanId);
    }

    let code = typeof input.codigo === 'string' ? input.codigo.trim() : '';
    if (!code) {
      let careerCode = 'CUR';
      if (paralelo.careerId) {
        try {
          const carrera = await this.careerRepository.findById(paralelo.careerId);
          if (carrera?.code) careerCode = tightSegment(carrera.code, 12);
        } catch (e) {
          this.logger.warn('[Académico] No se pudo leer código de carrera para curso', { error: e.message });
        }
      }
      let materiaSigla = 'MAT';
      if (planSubject.subjectId) {
        try {
          const materia = await this.subjectRepository.findById(planSubject.subjectId);
          if (materia?.acronym) materiaSigla = tightSegment(materia.acronym, 12);
        } catch (e) {
          this.logger.warn('[Académico] No se pudo leer sigla de materia para curso', { error: e.message });
        }
      }
      const nombrePar = tightSegment(paralelo.name, 8);
      const turno = tightSegment(paralelo.shift, 6);
      code = `${careerCode}-${nombrePar}-${turno}-${materiaSigla}-AP${asignaturaPlanId}`;
      if (code.length > 50) {
        code = code.slice(0, 50);
      }
    } else if (code.length > 50) {
      throw new ValidationError('codigo admite como máximo 50 caracteres');
    }

    const course = new Course({
      code,
      parallelId,
      planSubjectId: asignaturaPlanId,
      maxCapacity: maxCap,
      minCapacity: minCap,
      colorHex,
    });

    if (!course.isValidCapacity()) {
      throw new ValidationError('Capacidades del curso inválidas');
    }

    const created = await this.courseRepository.create(course, userId);
    const plain = typeof created.toPlainObject === 'function' ? created.toPlainObject() : created;

    let materiaId = null;
    let materiaNombre = null;
    let materiaSigla = null;
    if (planSubject.subjectId) {
      try {
        const materia = await this.subjectRepository.findById(planSubject.subjectId);
        materiaId = materia?.id ?? null;
        materiaNombre = materia?.name ?? null;
        materiaSigla = materia?.acronym ?? null;
      } catch (e) {
        this.logger.warn('[Académico] No se pudo cargar materia del curso creado', { error: e.message });
      }
    }

    return {
      curso: {
        cursoId: created.id,
        codigo: plain.code ?? null,
        cupoMaximo: plain.maxCapacity ?? null,
        cupoMinimo: plain.minCapacity ?? null,
        colorHex: plain.colorHex ?? colorHex,
        asignaturaPlanId: asignaturaPlanId,
        materiaId,
        materiaNombre,
        materiaSigla,
        horasSemanalesPlan: planSubject.weeklyHours ?? null,
        bloquesCount: 0,
        tieneHorarios: false,
      },
    };
  }
}
