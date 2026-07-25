import { NotFoundError, ValidationError, ConflictError } from '../../../domain/errors/AppError.js';
import {
  ORIGENES_PARTICIPANTE_SESION,
  PROGRESOS_PARTICIPANTE_SESION,
} from '../../../domain/constants/tutorias.constants.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { SesionReforzamientoMapper } from '../../mappers/tutorias/index.js';

/**
 * Use Case: RegisterAsistenciaSesionUseCase (A9)
 * Módulo: Tutorías (TUT · acompañamiento)
 *
 * Registro BATCH de participantes de la sesión (PUT reemplazo lógico):
 * - actualiza asistencia/progreso/observaciones de participantes existentes;
 * - agrega nuevos participantes (validando pertenencia a la oferta del curso
 *   de la sesión y no duplicados);
 * - los participantes vigentes que NO vienen en el batch se retiran (soft).
 *
 * Todo en UNA transacción. Devuelve el roster enriquecido (join a vista 156).
 */
export class RegisterAsistenciaSesionUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.sesionReforzamientoRepository
   * @param {Object} params.sesionReforzamientoParticipanteRepository
   * @param {Object} params.acompanamientoSesionViewRepository - Roster enriquecido
   * @param {Object} params.teacherAssignmentRepository - Oferta del curso de la sesión
   * @param {Object} params.subjectEnrollmentRepository - Validación matrícula/oferta
   * @param {ILogger} params.logger
   */
  constructor({
    sesionReforzamientoRepository,
    sesionReforzamientoParticipanteRepository,
    acompanamientoSesionViewRepository,
    teacherAssignmentRepository,
    subjectEnrollmentRepository,
    logger,
  }) {
    this.sesionReforzamientoRepository = sesionReforzamientoRepository;
    this.sesionReforzamientoParticipanteRepository = sesionReforzamientoParticipanteRepository;
    this.acompanamientoSesionViewRepository = acompanamientoSesionViewRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.logger = logger;
  }

  /**
   * @param {number} sesionId
   * @param {Object} body - { participantes: [{ matriculaMateriaId, origen?, asistio?, progreso?, observaciones? }] }
   * @param {number|null} userId
   * @returns {Promise<{participantes: Array}>}
   */
  async execute(sesionId, body = {}, userId = null) {
    const sesion = await this.sesionReforzamientoRepository.findById(sesionId);
    if (!sesion) {
      throw new NotFoundError(`sesión de reforzamiento con ID ${sesionId}`);
    }

    const batch = this._normalizeBatch(body.participantes);
    await this._validatePertenencia(batch, sesion);

    const vigentes = await this.sesionReforzamientoParticipanteRepository.findBySesionId(sesionId);
    const vigentesPorMatricula = new Map(
      vigentes.map((participante) => [Number(participante.matriculaMateriaId), participante])
    );
    const batchMatriculas = new Set(batch.map((participante) => participante.matriculaMateriaId));

    await sequelize.transaction(async (transaction) => {
      // 1. Upsert de los participantes del batch.
      for (const participante of batch) {
        const existente = vigentesPorMatricula.get(participante.matriculaMateriaId);
        const data = {
          origen: participante.origen ?? existente?.origen ?? ORIGENES_PARTICIPANTE_SESION.RIESGO,
          asistio: participante.asistio ?? null,
          progreso:
            participante.progreso ??
            existente?.progreso ??
            PROGRESOS_PARTICIPANTE_SESION.SIN_EVALUAR,
          observaciones: participante.observaciones ?? null,
        };
        if (existente) {
          // eslint-disable-next-line no-await-in-loop
          await this.sesionReforzamientoParticipanteRepository.update(existente.id, data, userId, {
            transaction,
          });
        } else {
          // eslint-disable-next-line no-await-in-loop
          await this.sesionReforzamientoParticipanteRepository.create(
            {
              sesionReforzamientoId: sesionId,
              matriculaMateriaId: participante.matriculaMateriaId,
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
          await this.sesionReforzamientoParticipanteRepository.delete(vigente.id, userId);
        }
      }
    });

    const rosterRows =
      await this.acompanamientoSesionViewRepository.findParticipantesBySesionId(sesionId);

    const conservados = [...batchMatriculas].filter((id) => vigentesPorMatricula.has(id)).length;
    this.logger.info('[Tutorías] Asistencia de sesión registrada (batch)', {
      sesionId,
      participantes: batch.length,
      retirados: vigentes.length - conservados,
    });

    return {
      participantes: SesionReforzamientoMapper.participanteRowsToPresentation(rosterRows),
    };
  }

  /** @private */
  _normalizeBatch(participantes) {
    if (!Array.isArray(participantes)) {
      throw new ValidationError('participantes debe ser un array');
    }
    const normalizados = participantes.map((participante) => ({
      ...participante,
      matriculaMateriaId: Number(participante.matriculaMateriaId),
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
  async _validatePertenencia(batch, sesion) {
    if (batch.length === 0 || !sesion.asignacionDocenteId) return;
    const asignacion = await this.teacherAssignmentRepository.findById(sesion.asignacionDocenteId);
    const plainAsignacion = asignacion?.toPlainObject?.() ?? asignacion ?? {};
    const ofertaCursoId = Number(plainAsignacion.offerCourseId ?? plainAsignacion.ofertaCursoId);

    for (const participante of batch) {
      // eslint-disable-next-line no-await-in-loop
      const matricula = await this.subjectEnrollmentRepository.findById(
        participante.matriculaMateriaId
      );
      if (!matricula) {
        throw new NotFoundError(`matrícula de materia con ID ${participante.matriculaMateriaId}`);
      }
      const plain = matricula?.toPlainObject?.() ?? matricula;
      const matriculaOferta = Number(plain.offerCourseId ?? plain.ofertaCursoId);
      if (Number.isFinite(ofertaCursoId) && matriculaOferta !== ofertaCursoId) {
        throw new ValidationError(
          `La matrícula ${participante.matriculaMateriaId} no pertenece a la oferta del curso de la sesión (oferta ${ofertaCursoId}).`
        );
      }
    }
  }
}
