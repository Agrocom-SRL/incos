import { ValidationError, NotFoundError } from '../../../../domain/errors/AppError.js';
import { TIPOS_DECISION_ADMINISTRATIVA_VALUES } from '../../../../domain/constants/inscripciones.constants.js';
import { sequelize } from '../../../../infrastructure/database/sequelize.js';

/**
 * Decisión administrativa ABANDONO/RETIRADO sobre una matrícula CURSADA
 * (schema 16-nivelaciones.sql: "DECISIONES ADMINISTRATIVAS — nota_resultante +
 * nota_forzada=TRUE. Sin fila en nivelaciones"). Permiso
 * `academico.nivelacion.aprobar` — RECTOR/DIR_ACADEMICO únicamente (seed 59).
 *
 * Dos escrituras:
 *  1. `historial_matricula` (bitácora, vía RegistrarEventoHistorialMatriculaUseCase)
 *     — de ahí sale la nota efectiva del Historial Académico (vista 138, ya
 *     cascada por precedencia: forzada → nivelación aprobada → nota_final).
 *  2. `matriculas_materia.estado` (caché en vivo que YA leen el cuaderno de
 *     notas y la asistencia — vista 110 — y el Centralizador/Libro):
 *     al quedar en ABANDONO/RETIRADO, el estudiante desaparece automáticamente
 *     del roster activo de carga de notas/asistencia del docente, sin
 *     necesidad de ninguna notificación aparte.
 */
export class RegistrarDecisionAdministrativaUseCase {
  constructor({
    registrarEventoHistorialMatriculaUseCase,
    subjectEnrollmentRepository,
    logger,
  }) {
    if (!registrarEventoHistorialMatriculaUseCase) {
      throw new Error('registrarEventoHistorialMatriculaUseCase es requerido');
    }
    if (!subjectEnrollmentRepository) {
      throw new Error('subjectEnrollmentRepository es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.registrarEventoHistorialMatriculaUseCase = registrarEventoHistorialMatriculaUseCase;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {number} params.subjectEnrollmentId - matricula_materia_id.
   * @param {'ABANDONO'|'RETIRADO'} params.stateType
   * @param {number} params.resultingGrade - Nota fijada por la decisión (0-100).
   * @param {string|null} [params.transitionDate]
   * @param {string|null} [params.observations]
   * @returns {Promise<{evento: Object}>}
   */
  async execute({
    usuarioId,
    subjectEnrollmentId,
    stateType,
    resultingGrade,
    transitionDate,
    observations,
  }) {
    if (!TIPOS_DECISION_ADMINISTRATIVA_VALUES.includes(stateType)) {
      throw new ValidationError(
        `stateType debe ser uno de: ${TIPOS_DECISION_ADMINISTRATIVA_VALUES.join(', ')}`,
      );
    }

    const id = Number.parseInt(String(subjectEnrollmentId), 10);
    if (!Number.isFinite(id) || id < 1) {
      throw new ValidationError('subjectEnrollmentId inválido');
    }

    const matricula = await this.subjectEnrollmentRepository.findById(id);
    if (!matricula) {
      throw new NotFoundError('Matrícula de materia');
    }

    let evento;
    await sequelize.transaction(async (transaction) => {
      ({ evento } = await this.registrarEventoHistorialMatriculaUseCase.execute(
        {
          usuarioId,
          subjectEnrollmentId: id,
          stateType,
          transitionDate,
          resultingGrade,
          forcedGrade: true,
          observations,
        },
        { transaction },
      ));

      await this.subjectEnrollmentRepository.update(
        id,
        { status: stateType },
        usuarioId,
        { transaction },
      );
    });

    this.logger.info('[Nivelaciones] Decisión administrativa registrada', {
      subjectEnrollmentId: id,
      stateType,
      eventoId: evento?.id,
    });

    return { evento };
  }
}

export default RegistrarDecisionAdministrativaUseCase;
