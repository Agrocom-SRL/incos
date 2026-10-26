import { parseIdPositivo } from '../../../utils/validacionEntrada.js';
import { ValidationError } from '../../../../domain/errors/AppError.js';
import { SubjectEnrollmentHistory } from '../../../../domain/entities/SubjectEnrollmentHistory.js';

/**
 * Registra un evento del ciclo de vida de una matrícula (historial_matricula):
 * intento académico, transición sin nota, o decisión administrativa. Caso
 * ABANDONO/RETIRADO específico: ver RegistrarDecisionAdministrativaUseCase,
 * que reutiliza este use case y además sincroniza matriculas_materia.estado.
 *
 * Anclaje mutuamente excluyente (schema 16-nivelaciones.sql):
 *   - Evento sobre materia CURSADA → subjectEnrollmentId (matricula_materia_id).
 *   - Evento sobre materia NO cursada (arrastre, choque de horario, etc.) →
 *     enrollmentId + planSubjectId, juntos.
 * Al crear un nuevo evento vigente se expira (vigente=FALSE) el evento
 * vigente anterior de la MISMA ancla — una ancla tiene un solo estado
 * vigente a la vez.
 */
export class RegistrarEventoHistorialMatriculaUseCase {
  constructor({ subjectEnrollmentHistoryRepository, logger }) {
    if (!subjectEnrollmentHistoryRepository) {
      throw new Error('subjectEnrollmentHistoryRepository es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.subjectEnrollmentHistoryRepository = subjectEnrollmentHistoryRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {number|null} [params.subjectEnrollmentId] - Ancla: materia cursada.
   * @param {number|null} [params.enrollmentId] - Ancla alterna: inscripción.
   * @param {number|null} [params.planSubjectId] - Ancla alterna: materia del plan.
   * @param {string} params.stateType
   * @param {string|null} [params.transitionDate]
   * @param {number|null} [params.resultingGrade]
   * @param {boolean} [params.forcedGrade]
   * @param {string|null} [params.observations]
   * @param {Object} [options]
   * @param {import('sequelize').Transaction} [options.transaction] - Para
   *   componerse dentro de la transacción de un use case llamador (ver
   *   RegistrarDecisionAdministrativaUseCase).
   * @returns {Promise<{evento: Object}>}
   */
  async execute(
    {
      usuarioId,
      subjectEnrollmentId,
      enrollmentId,
      planSubjectId,
      stateType,
      transitionDate,
      resultingGrade,
      forcedGrade,
      observations,
    },
    options = {},
  ) {
    const ancla = this._resolverAncla({ subjectEnrollmentId, enrollmentId, planSubjectId });

    const entidad = new SubjectEnrollmentHistory({
      ...ancla,
      stateType,
      transitionDate: transitionDate ?? null,
      resultingGrade: resultingGrade ?? null,
      forcedGrade: Boolean(forcedGrade),
      observations: observations != null ? String(observations).trim() || null : null,
      current: true,
    });

    const errores = entidad.getBusinessRuleErrors();
    if (errores.length > 0) {
      throw new ValidationError(errores.join(' '));
    }

    const repoOptions = { transaction: options.transaction };

    if (ancla.subjectEnrollmentId != null) {
      await this.subjectEnrollmentHistoryRepository.expireCurrentBySubjectEnrollmentId(
        ancla.subjectEnrollmentId,
        usuarioId,
        repoOptions,
      );
    } else {
      await this.subjectEnrollmentHistoryRepository.expireCurrentByAlternateAnchor(
        ancla.enrollmentId,
        ancla.planSubjectId,
        usuarioId,
        repoOptions,
      );
    }

    const creado = await this.subjectEnrollmentHistoryRepository.create(
      entidad.toPlainObject(),
      usuarioId,
      repoOptions,
    );

    this.logger.info('[Nivelaciones] Evento de historial registrado', {
      id: creado?.id,
      stateType,
      subjectEnrollmentId: ancla.subjectEnrollmentId,
      enrollmentId: ancla.enrollmentId,
      planSubjectId: ancla.planSubjectId,
    });

    return { evento: creado };
  }

  /**
   * Valida y normaliza el anclaje mutuamente excluyente.
   * @returns {{subjectEnrollmentId: number|null, enrollmentId: number|null, planSubjectId: number|null}}
   */
  _resolverAncla({ subjectEnrollmentId, enrollmentId, planSubjectId }) {
    const tieneMatricula = subjectEnrollmentId != null;
    const tieneAlternaParcial = (enrollmentId != null) !== (planSubjectId != null);
    const tieneAlterna = enrollmentId != null && planSubjectId != null;

    if (tieneAlternaParcial) {
      throw new ValidationError(
        'enrollmentId y planSubjectId deben enviarse juntos (ancla de materia no cursada).',
      );
    }
    if (tieneMatricula === tieneAlterna) {
      throw new ValidationError(
        'Debe indicar exactamente una ancla: subjectEnrollmentId (materia cursada) ' +
          'o enrollmentId + planSubjectId (materia no cursada).',
      );
    }

    return {
      subjectEnrollmentId: tieneMatricula ? parseIdPositivo(subjectEnrollmentId, 'subjectEnrollmentId') : null,
      enrollmentId: tieneAlterna ? parseIdPositivo(enrollmentId, 'enrollmentId') : null,
      planSubjectId: tieneAlterna ? parseIdPositivo(planSubjectId, 'planSubjectId') : null,
    };
  }
}

export default RegistrarEventoHistorialMatriculaUseCase;
