import { NotFoundError, ValidationError, ConflictError } from '../../../domain/errors/AppError.js';
import {
  MODALIDADES_SESION_REFORZAMIENTO,
  ESTADOS_SESION_REFORZAMIENTO,
  ORIGENES_PARTICIPANTE_SESION,
  PROGRESOS_PARTICIPANTE_SESION,
} from '../../../domain/constants/tutorias.constants.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';

/**
 * Use Case: CreateSesionReforzamientoUseCase (A6)
 * Módulo: Tutorías (TUT · acompañamiento)
 *
 * Crea una sesión de reforzamiento anclada a una asignación docente vigente
 * y sus participantes iniciales en UNA transacción. Validaciones:
 * - la asignación docente existe;
 * - modalidad PRESENCIAL requiere aula (catálogo aulas); VIRTUAL, enlace;
 * - cada participante (matriculaMateriaId) pertenece a la MISMA oferta del
 *   curso de la sesión (matriculas_materia.oferta_curso_id);
 * - sin participantes duplicados.
 */
export class CreateSesionReforzamientoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.sesionReforzamientoRepository
   * @param {Object} params.sesionReforzamientoParticipanteRepository
   * @param {Object} params.teacherAssignmentRepository - Validación asignación (cadena académica)
   * @param {Object} params.subjectEnrollmentRepository - Validación matrícula/oferta
   * @param {Object} params.classroomRepository - Validación aula
   * @param {ILogger} params.logger
   */
  constructor({
    sesionReforzamientoRepository,
    sesionReforzamientoParticipanteRepository,
    teacherAssignmentRepository,
    subjectEnrollmentRepository,
    classroomRepository,
    logger,
  }) {
    this.sesionReforzamientoRepository = sesionReforzamientoRepository;
    this.sesionReforzamientoParticipanteRepository = sesionReforzamientoParticipanteRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.classroomRepository = classroomRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} body - Datos de la sesión + participantes[]
   * @param {number|null} userId
   * @returns {Promise<{sesionReforzamiento: Object}>}
   */
  async execute(body = {}, userId = null) {
    const asignacion = await this._validateAsignacion(body.asignacionDocenteId);
    this._validateModalidad(body);
    await this._validateAula(body);

    const participantes = this._normalizeParticipantes(body.participantes);
    await this._validateParticipantes(participantes, asignacion);

    const data = {
      asignacionDocenteId: Number(body.asignacionDocenteId),
      fecha: body.fecha ?? null,
      horaInicio: body.horaInicio ?? null,
      horaFin: body.horaFin ?? null,
      modalidad: body.modalidad ?? MODALIDADES_SESION_REFORZAMIENTO.PRESENCIAL,
      aulaId: body.aulaId ?? null,
      enlaceVirtual: body.enlaceVirtual ?? null,
      tema: body.tema ?? null,
      estado: ESTADOS_SESION_REFORZAMIENTO.PROGRAMADA,
      observaciones: body.observaciones ?? null,
    };

    let created = null;
    await sequelize.transaction(async (transaction) => {
      created = await this.sesionReforzamientoRepository.create(data, userId, { transaction });
      for (const participante of participantes) {
        await this.sesionReforzamientoParticipanteRepository.create(
          {
            sesionReforzamientoId: created.id,
            matriculaMateriaId: participante.matriculaMateriaId,
            origen: participante.origen ?? ORIGENES_PARTICIPANTE_SESION.RIESGO,
            progreso: PROGRESOS_PARTICIPANTE_SESION.SIN_EVALUAR,
          },
          userId,
          { transaction }
        );
      }
    });

    this.logger.info('[Tutorías] Sesión de reforzamiento creada', {
      id: created.id,
      asignacionDocenteId: data.asignacionDocenteId,
      participantes: participantes.length,
    });

    return { sesionReforzamiento: created };
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
    const modalidad = body.modalidad ?? MODALIDADES_SESION_REFORZAMIENTO.PRESENCIAL;
    if (modalidad === MODALIDADES_SESION_REFORZAMIENTO.PRESENCIAL && !body.aulaId) {
      throw new ValidationError('aulaId es requerido para sesiones PRESENCIALES');
    }
    if (modalidad === MODALIDADES_SESION_REFORZAMIENTO.VIRTUAL && !body.enlaceVirtual) {
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
  _normalizeParticipantes(participantes) {
    if (participantes === undefined || participantes === null) return [];
    if (!Array.isArray(participantes)) {
      throw new ValidationError('participantes debe ser un array');
    }
    const normalizados = participantes.map((participante) => ({
      matriculaMateriaId: Number(participante.matriculaMateriaId),
      origen: participante.origen,
    }));
    if (
      normalizados.some(
        (participante) =>
          !Number.isInteger(participante.matriculaMateriaId) || participante.matriculaMateriaId <= 0
      )
    ) {
      throw new ValidationError('cada participante requiere un matriculaMateriaId entero positivo');
    }
    const ids = normalizados.map((participante) => participante.matriculaMateriaId);
    if (new Set(ids).size !== ids.length) {
      throw new ConflictError('participantes contiene matrículas duplicadas');
    }
    return normalizados;
  }

  /** @private Cada matrícula debe pertenecer a la oferta del curso de la sesión. */
  async _validateParticipantes(participantes, asignacion) {
    const ofertaCursoId = Number(asignacion.offerCourseId ?? asignacion.ofertaCursoId);
    for (const participante of participantes) {
      const matricula = await this.subjectEnrollmentRepository.findById(
        participante.matriculaMateriaId
      );
      if (!matricula) {
        throw new NotFoundError(`matrícula de materia con ID ${participante.matriculaMateriaId}`);
      }
      const plain = matricula?.toPlainObject?.() ?? matricula;
      const matriculaOferta = Number(plain.offerCourseId ?? plain.ofertaCursoId);
      if (matriculaOferta !== ofertaCursoId) {
        throw new ValidationError(
          `La matrícula ${participante.matriculaMateriaId} no pertenece a la oferta del curso de la sesión (oferta ${ofertaCursoId}).`
        );
      }
    }
  }
}
