import { NotFoundError, ValidationError, ConflictError } from '../../../../domain/errors/AppError.js';
import {
  MODALIDADES_SESION_REFUERZO,
  ESTADOS_SESION_REFUERZO,
  ORIGENES_ESTUDIANTE_SESION,
  PROGRESOS_ESTUDIANTE_SESION,
} from '../../../../domain/constants/academico.acompanamiento.constants.js';
import { sequelize } from '../../../../infrastructure/database/sequelize.js';

/**
 * Use Case: CreateSesionRefuerzoUseCase (A6)
 * Módulo: Académico (ACA · acompañamiento)
 *
 * Crea una sesión de refuerzo anclada a una asignación docente vigente
 * y sus estudiantes iniciales en UNA transacción. Validaciones:
 * - la asignación docente existe;
 * - modalidad PRESENCIAL requiere aula (catálogo aulas); VIRTUAL, enlace;
 * - cada estudiante (matriculaMateriaId) pertenece a la MISMA oferta del
 *   curso de la sesión (matriculas_materia.oferta_curso_id);
 * - sin estudiantes duplicados.
 */
export class CreateSesionRefuerzoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.sesionRefuerzoRepository
   * @param {Object} params.sesionRefuerzoEstudianteRepository
   * @param {Object} params.teacherAssignmentRepository - Validación asignación (cadena académica)
   * @param {Object} params.subjectEnrollmentRepository - Validación matrícula/oferta
   * @param {Object} params.classroomRepository - Validación aula
   * @param {ILogger} params.logger
   */
  constructor({
    sesionRefuerzoRepository,
    sesionRefuerzoEstudianteRepository,
    teacherAssignmentRepository,
    subjectEnrollmentRepository,
    classroomRepository,
    logger,
  }) {
    this.sesionRefuerzoRepository = sesionRefuerzoRepository;
    this.sesionRefuerzoEstudianteRepository = sesionRefuerzoEstudianteRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.classroomRepository = classroomRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} body - Datos de la sesión + estudiantes[]
   * @param {number|null} userId
   * @returns {Promise<{sesionRefuerzo: Object}>}
   */
  async execute(body = {}, userId = null) {
    const asignacion = await this._validateAsignacion(body.asignacionDocenteId);
    this._validateModalidad(body);
    await this._validateAula(body);

    const estudiantes = this._normalizeEstudiantes(body.estudiantes);
    await this._validateEstudiantes(estudiantes, asignacion);

    const data = {
      asignacionDocenteId: Number(body.asignacionDocenteId),
      fecha: body.fecha ?? null,
      horaInicio: body.horaInicio ?? null,
      horaFin: body.horaFin ?? null,
      modalidad: body.modalidad ?? MODALIDADES_SESION_REFUERZO.PRESENCIAL,
      aulaId: body.aulaId ?? null,
      enlaceVirtual: body.enlaceVirtual ?? null,
      tema: body.tema ?? null,
      estado: ESTADOS_SESION_REFUERZO.PROGRAMADA,
      observaciones: body.observaciones ?? null,
    };

    let created = null;
    await sequelize.transaction(async (transaction) => {
      created = await this.sesionRefuerzoRepository.create(data, userId, { transaction });
      for (const estudiante of estudiantes) {
        // eslint-disable-next-line no-await-in-loop
        await this.sesionRefuerzoEstudianteRepository.create(
          {
            sesionRefuerzoId: created.id,
            matriculaMateriaId: estudiante.matriculaMateriaId,
            origen: estudiante.origen ?? ORIGENES_ESTUDIANTE_SESION.RIESGO,
            progreso: PROGRESOS_ESTUDIANTE_SESION.SIN_EVALUAR,
          },
          userId,
          { transaction }
        );
      }
    });

    this.logger.info('[Acompañamiento] Sesión de refuerzo creada', {
      id: created.id,
      asignacionDocenteId: data.asignacionDocenteId,
      estudiantes: estudiantes.length,
    });

    return { sesionRefuerzo: created };
  }

  /** @private */
  async _validateAsignacion(asignacionDocenteId) {
    if (!asignacionDocenteId) {
      throw new ValidationError('asignacionDocenteId es requerido');
    }
    const asignacion = await this.teacherAssignmentRepository.findById(Number(asignacionDocenteId));
    if (!asignacion) {
      throw new NotFoundError(`asignación docente con ID ${asignacionDocenteId}`);
    }
    return asignacion?.toPlainObject?.() ?? asignacion;
  }

  /** @private */
  _validateModalidad(body) {
    const modalidad = body.modalidad ?? MODALIDADES_SESION_REFUERZO.PRESENCIAL;
    if (modalidad === MODALIDADES_SESION_REFUERZO.PRESENCIAL && !body.aulaId) {
      throw new ValidationError('aulaId es requerido para sesiones PRESENCIALES');
    }
    if (modalidad === MODALIDADES_SESION_REFUERZO.VIRTUAL && !body.enlaceVirtual) {
      throw new ValidationError('enlaceVirtual es requerido para sesiones VIRTUALES');
    }
  }

  /** @private */
  async _validateAula(body) {
    if (!body.aulaId) return;
    const aula = await this.classroomRepository.findById(Number(body.aulaId));
    if (!aula) {
      throw new NotFoundError(`aula con ID ${body.aulaId}`);
    }
  }

  /** @private */
  _normalizeEstudiantes(estudiantes) {
    if (estudiantes === undefined || estudiantes === null) return [];
    if (!Array.isArray(estudiantes)) {
      throw new ValidationError('estudiantes debe ser un array');
    }
    const normalizados = estudiantes.map((estudiante) => ({
      matriculaMateriaId: Number(estudiante.matriculaMateriaId),
      origen: estudiante.origen,
    }));
    if (
      normalizados.some(
        (estudiante) =>
          !Number.isInteger(estudiante.matriculaMateriaId) || estudiante.matriculaMateriaId <= 0
      )
    ) {
      throw new ValidationError('cada estudiante requiere un matriculaMateriaId entero positivo');
    }
    const ids = normalizados.map((estudiante) => estudiante.matriculaMateriaId);
    if (new Set(ids).size !== ids.length) {
      throw new ConflictError('estudiantes contiene matrículas duplicadas');
    }
    return normalizados;
  }

  /** @private Cada matrícula debe pertenecer a la oferta del curso de la sesión. */
  async _validateEstudiantes(estudiantes, asignacion) {
    const ofertaCursoId = Number(asignacion.offerCourseId ?? asignacion.ofertaCursoId);
    for (const estudiante of estudiantes) {
      // eslint-disable-next-line no-await-in-loop
      const matricula = await this.subjectEnrollmentRepository.findById(
        estudiante.matriculaMateriaId
      );
      if (!matricula) {
        throw new NotFoundError(`matrícula de materia con ID ${estudiante.matriculaMateriaId}`);
      }
      const plain = matricula?.toPlainObject?.() ?? matricula;
      const matriculaOferta = Number(plain.offerCourseId ?? plain.ofertaCursoId);
      if (matriculaOferta !== ofertaCursoId) {
        throw new ValidationError(
          `La matrícula ${estudiante.matriculaMateriaId} no pertenece a la oferta del curso de la sesión (oferta ${ofertaCursoId}).`
        );
      }
    }
  }
}
