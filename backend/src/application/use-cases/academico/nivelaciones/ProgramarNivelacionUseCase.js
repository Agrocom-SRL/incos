import { parseFechaISO, parseIdOpcional } from '../../../utils/validacionEntrada.js';
import { ValidationError } from '../../../../domain/errors/AppError.js';
import { TIPOS_INTENTO_ACADEMICO_VALUES } from '../../../../domain/constants/inscripciones.constants.js';
import { ESTADOS_NIVELACION } from '../../../../domain/constants/evaluaciones.constants.js';
import { sequelize } from '../../../../infrastructure/database/sequelize.js';

/**
 * Programa un examen extraordinario (nivelaciones, estado PROGRAMADA):
 * crea el evento de historial_matricula que habilita el intento (tipo
 * NIVELACION_1RA/2DA, PRUEBA_EXCEPCIONAL, RECUPERATORIO_ANUAL o ARTICULO_18
 * — «NIVELA ART. 18» en los libros reales, examen de nivelación, NO decisión
 * administrativa) y, en la MISMA transacción, la fila `nivelaciones` que lo
 * referencia. Sin nota todavía: nota_resultante queda NULL en el historial
 * (a diferencia de ABANDONO/RETIRADO); la nota real se registra al cerrar el
 * examen con RegistrarResultadoNivelacionUseCase.
 * Permiso: `academico.nivelacion.inscribir` (CREAR).
 */
export class ProgramarNivelacionUseCase {
  constructor({
    registrarEventoHistorialMatriculaUseCase,
    levelingRepository,
    logger,
  }) {
    if (!registrarEventoHistorialMatriculaUseCase) {
      throw new Error('registrarEventoHistorialMatriculaUseCase es requerido');
    }
    if (!levelingRepository) {
      throw new Error('levelingRepository es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.registrarEventoHistorialMatriculaUseCase = registrarEventoHistorialMatriculaUseCase;
    this.levelingRepository = levelingRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {number|null} [params.subjectEnrollmentId] - Ancla: materia cursada y reprobada.
   * @param {number|null} [params.enrollmentId] - Ancla alterna: inscripción (materia arrastrada).
   * @param {number|null} [params.planSubjectId] - Ancla alterna: materia del plan.
   * @param {string} params.stateType - Tipo de intento académico.
   * @param {string|null} [params.transitionDate]
   * @param {string|null} [params.observations]
   * @param {number|null} [params.managementId] - Gestión en la que se rinde.
   * @param {number|null} [params.evaluatorTeacherId]
   * @param {string|null} [params.examDate]
   * @returns {Promise<{evento: Object, nivelacion: Object}>}
   */
  async execute({
    usuarioId,
    subjectEnrollmentId,
    enrollmentId,
    planSubjectId,
    stateType,
    transitionDate,
    observations,
    managementId,
    evaluatorTeacherId,
    examDate,
  }) {
    if (!TIPOS_INTENTO_ACADEMICO_VALUES.includes(stateType)) {
      throw new ValidationError(
        `stateType debe ser uno de: ${TIPOS_INTENTO_ACADEMICO_VALUES.join(', ')}`,
      );
    }

    const managementIdValido = parseIdOpcional(managementId, 'managementId');
    const evaluatorTeacherIdValido = parseIdOpcional(evaluatorTeacherId, 'evaluatorTeacherId');
    const examDateValida =
      examDate == null || examDate === '' ? null : parseFechaISO(examDate, 'examDate');

    let evento;
    let nivelacion;
    await sequelize.transaction(async (transaction) => {
      ({ evento } = await this.registrarEventoHistorialMatriculaUseCase.execute(
        {
          usuarioId,
          subjectEnrollmentId,
          enrollmentId,
          planSubjectId,
          stateType,
          transitionDate,
          observations,
        },
        { transaction },
      ));

      nivelacion = await this.levelingRepository.create(
        {
          subjectEnrollmentHistoryId: evento.id,
          managementId: managementIdValido,
          evaluatorTeacherId: evaluatorTeacherIdValido,
          examDate: examDateValida,
          status: ESTADOS_NIVELACION.PROGRAMADA,
        },
        usuarioId,
        { transaction },
      );
    });

    this.logger.info('[Nivelaciones] Nivelación programada', {
      eventoId: evento?.id,
      nivelacionId: nivelacion?.id,
      stateType,
    });

    return { evento, nivelacion };
  }
}

export default ProgramarNivelacionUseCase;
