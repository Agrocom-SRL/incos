import { ValidationError, NotFoundError } from '../../../../domain/errors/AppError.js';
import { Leveling } from '../../../../domain/entities/Leveling.js';
import {
  ESTADOS_NIVELACION_FINALES,
  TRANSICIONES_NIVELACION,
} from '../../../../domain/constants/evaluaciones.constants.js';

/** Nota mínima de aprobación de un examen de nivelación (fija por schema, no
 * ligada a la política institucional de bimestres — ver comentario de
 * `nivelaciones.nota_nivelacion` en 16-nivelaciones.sql). */
const NOTA_MINIMA_NIVELACION = 61;

/**
 * Registra el resultado de un examen de nivelación (transición de estado +
 * nota, si corresponde). No toca `matriculas_materia`: el Historial
 * Académico (vista 138) ya cascada `nivelaciones.nota_nivelacion` como nota
 * efectiva cuando `estado = APROBADA`, sin necesidad de escritura adicional.
 * Permiso: `academico.nivelacion.aprobar` (APROBAR).
 */
export class RegistrarResultadoNivelacionUseCase {
  constructor({ levelingRepository, logger }) {
    if (!levelingRepository) {
      throw new Error('levelingRepository es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.levelingRepository = levelingRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {number} params.levelingId
   * @param {string} params.status - Estado destino (ver TRANSICIONES_NIVELACION).
   * @param {number|null} [params.levelingGrade] - Nota obtenida (0-100).
   * @param {boolean|null} [params.passed] - Si no se envía, se deriva de levelingGrade.
   * @param {string|null} [params.observations]
   * @returns {Promise<{nivelacion: Object}>}
   */
  async execute({ usuarioId, levelingId, status, levelingGrade, passed, observations }) {
    const id = Number.parseInt(String(levelingId), 10);
    if (!Number.isFinite(id) || id < 1) {
      throw new ValidationError('levelingId inválido');
    }

    const actual = await this.levelingRepository.findById(id);
    if (!actual) {
      throw new NotFoundError('Nivelación');
    }

    const permitidos = TRANSICIONES_NIVELACION[actual.status] ?? [];
    if (!permitidos.includes(status)) {
      throw new ValidationError(`Transición inválida: ${actual.status} → ${status}`);
    }

    const notaFinal = levelingGrade ?? null;
    if (ESTADOS_NIVELACION_FINALES.includes(status) && notaFinal == null) {
      throw new ValidationError(`El estado ${status} requiere levelingGrade`);
    }

    const aprobadoFinal =
      passed ?? (notaFinal != null ? Number(notaFinal) >= NOTA_MINIMA_NIVELACION : null);

    // `observations` solo se incluye si el llamador lo mandó — de lo contrario
    // `hasOwnProperty` en la entidad lo vería como "presente" con valor
    // undefined y el mapper lo interpretaría como "limpiar observaciones".
    const datosActualizacion = { status, levelingGrade: notaFinal, passed: aprobadoFinal };
    if (observations !== undefined) {
      const texto = observations != null ? String(observations).trim() : '';
      datosActualizacion.observations = texto || null;
    }

    const entidad = new Leveling(datosActualizacion);

    if (!entidad.isValidStatus()) {
      throw new ValidationError('status inválido');
    }
    if (!entidad.isValidLevelingGrade()) {
      throw new ValidationError('levelingGrade debe estar entre 0 y 100');
    }

    const actualizada = await this.levelingRepository.update(
      id,
      entidad.toPlainObject(),
      usuarioId,
    );

    this.logger.info('[Nivelaciones] Resultado de nivelación registrado', {
      levelingId: id,
      de: actual.status,
      a: status,
      aprobado: aprobadoFinal,
    });

    return { nivelacion: actualizada };
  }
}

export default RegistrarResultadoNivelacionUseCase;
