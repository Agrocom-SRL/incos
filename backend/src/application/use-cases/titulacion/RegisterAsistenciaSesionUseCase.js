import { NotFoundError, ValidationError, ConflictError } from '../../../domain/errors/AppError.js';
import {
  ORIGENES_ESTUDIANTE_SESION,
  PROGRESOS_ESTUDIANTE_SESION,
} from '../../../domain/constants/tutorias.constants.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { SesionRefuerzoMapper } from '../../mappers/tutorias/index.js';

/**
 * Use Case: RegisterAsistenciaSesionUseCase (A9)
 * Módulo: Tutorías (TUT · acompañamiento)
 *
 * Registro BATCH de estudiantes de la sesión (PUT reemplazo lógico):
 * - actualiza asistencia/progreso/observaciones de estudiantes existentes;
 * - agrega nuevos estudiantes (validando pertenencia a la oferta del curso
 *   de la sesión y no duplicados);
 * - los estudiantes vigentes que NO vienen en el batch se retiran (soft).
 *
 * Todo en UNA transacción. Devuelve el roster enriquecido (join a vista 156).
 */
export class RegisterAsistenciaSesionUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.sesionRefuerzoRepository
   * @param {Object} params.sesionRefuerzoEstudianteRepository
   * @param {Object} params.acompanamientoSesionViewRepository - Roster enriquecido
   * @param {Object} params.teacherAssignmentRepository - Oferta del curso de la sesión
   * @param {Object} params.subjectEnrollmentRepository - Validación matrícula/oferta
   * @param {ILogger} params.logger
   */
  constructor({
    sesionRefuerzoRepository,
    sesionRefuerzoEstudianteRepository,
    acompanamientoSesionViewRepository,
    teacherAssignmentRepository,
    subjectEnrollmentRepository,
    logger,
  }) {
    this.sesionRefuerzoRepository = sesionRefuerzoRepository;
    this.sesionRefuerzoEstudianteRepository = sesionRefuerzoEstudianteRepository;
    this.acompanamientoSesionViewRepository = acompanamientoSesionViewRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.logger = logger;
  }

  /**
   * @param {number} sesionId
   * @param {Object} body - { estudiantes: [{ matriculaMateriaId, origen?, asistio?, progreso?, observaciones? }] }
   * @param {number|null} userId
   * @returns {Promise<{estudiantes: Array}>}
   */
  async execute(sesionId, body = {}, userId = null) {
    const sesion = await this.sesionRefuerzoRepository.findById(sesionId);
    if (!sesion) {
      throw new NotFoundError(`sesión de refuerzo con ID ${sesionId}`);
    }

    const batch = this._normalizeBatch(body.estudiantes);
    await this._validatePertenencia(batch, sesion);

    const vigentes = await this.sesionRefuerzoEstudianteRepository.findBySesionId(sesionId);
    const vigentesPorMatricula = new Map(
      vigentes.map((estudiante) => [Number(estudiante.matriculaMateriaId), estudiante])
    );
    const batchMatriculas = new Set(batch.map((estudiante) => estudiante.matriculaMateriaId));

    await sequelize.transaction(async (transaction) => {
      // 1. Upsert de los estudiantes del batch.
      for (const estudiante of batch) {
        const existente = vigentesPorMatricula.get(estudiante.matriculaMateriaId);
        const data = {
          origen: estudiante.origen ?? existente?.origen ?? ORIGENES_ESTUDIANTE_SESION.RIESGO,
          asistio: estudiante.asistio ?? null,
          progreso:
            estudiante.progreso ??
            existente?.progreso ??
            PROGRESOS_ESTUDIANTE_SESION.SIN_EVALUAR,
          observaciones: estudiante.observaciones ?? null,
        };
        if (existente) {
          // eslint-disable-next-line no-await-in-loop
          await this.sesionRefuerzoEstudianteRepository.update(existente.id, data, userId, {
            transaction,
          });
        } else {
          // eslint-disable-next-line no-await-in-loop
          await this.sesionRefuerzoEstudianteRepository.create(
            {
              sesionRefuerzoId: sesionId,
              matriculaMateriaId: estudiante.matriculaMateriaId,
              ...data,
            },
            userId,
            { transaction }
          );
        }
      }

      // 2. Retiro (soft) de los vigentes que no vienen en el batch.
      for (const vigente of vigentes) {
        if (!batchMatriculas.has(Number(vigente.matriculaMateriaId))) {
          // eslint-disable-next-line no-await-in-loop
          await this.sesionRefuerzoEstudianteRepository.delete(vigente.id, userId);
        }
      }
    });

    const rosterRows =
      await this.acompanamientoSesionViewRepository.findEstudiantesBySesionId(sesionId);

    const conservados = [...batchMatriculas].filter((id) => vigentesPorMatricula.has(id)).length;
    this.logger.info('[Tutorías] Asistencia de sesión registrada (batch)', {
      sesionId,
      estudiantes: batch.length,
      retirados: vigentes.length - conservados,
    });

    return {
      estudiantes: SesionRefuerzoMapper.estudianteRowsToPresentation(rosterRows),
    };
  }

  /** @private */
  _normalizeBatch(estudiantes) {
    if (!Array.isArray(estudiantes)) {
      throw new ValidationError('estudiantes debe ser un array');
    }
    const normalizados = estudiantes.map((estudiante) => ({
      ...estudiante,
      matriculaMateriaId: Number(estudiante.matriculaMateriaId),
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
  async _validatePertenencia(batch, sesion) {
    if (batch.length === 0 || !sesion.asignacionDocenteId) return;
    const asignacion = await this.teacherAssignmentRepository.findById(sesion.asignacionDocenteId);
    const plainAsignacion = asignacion?.toPlainObject?.() ?? asignacion ?? {};
    const ofertaCursoId = Number(plainAsignacion.offerCourseId ?? plainAsignacion.ofertaCursoId);

    for (const estudiante of batch) {
      // eslint-disable-next-line no-await-in-loop
      const matricula = await this.subjectEnrollmentRepository.findById(
        estudiante.matriculaMateriaId
      );
      if (!matricula) {
        throw new NotFoundError(`matrícula de materia con ID ${estudiante.matriculaMateriaId}`);
      }
      const plain = matricula?.toPlainObject?.() ?? matricula;
      const matriculaOferta = Number(plain.offerCourseId ?? plain.ofertaCursoId);
      if (Number.isFinite(ofertaCursoId) && matriculaOferta !== ofertaCursoId) {
        throw new ValidationError(
          `La matrícula ${estudiante.matriculaMateriaId} no pertenece a la oferta del curso de la sesión (oferta ${ofertaCursoId}).`
        );
      }
    }
  }
}
