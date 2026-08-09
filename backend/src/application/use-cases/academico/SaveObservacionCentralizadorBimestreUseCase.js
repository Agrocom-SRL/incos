import { ValidationError } from '../../../domain/errors/AppError.js';
import { VERDICTOS_OBSERVACION_BIMESTRE_VALUES } from '../../../domain/constants/evaluaciones.constants.js';

/**
 * Persiste la observación del bimestre en bimestres_matricula.observaciones
 * (todas las matrículas del estudiante en el paralelo). Verdicto de catálogo
 * fijo (ver `VERDICTOS_OBSERVACION_BIMESTRE`), no texto libre — la columna
 * sigue siendo TEXT en BD, la restricción vive acá (Fase B1).
 */
export class SaveObservacionCentralizadorBimestreUseCase {
  constructor({ subjectEnrollmentBimesterRepository, logger }) {
    if (!subjectEnrollmentBimesterRepository) {
      throw new Error('subjectEnrollmentBimesterRepository es requerido');
    }
    this.subjectEnrollmentBimesterRepository = subjectEnrollmentBimesterRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {number} params.paraleloGestionId
   * @param {number} params.estudianteId
   * @param {number} params.bimestre
   * @param {string|null|undefined} params.observacion
   */
  async execute({ usuarioId, paraleloGestionId, estudianteId, bimestre, observacion }) {
    const pgId = this._parseId(paraleloGestionId, 'paraleloGestionId');
    const estId = this._parseId(estudianteId, 'estudianteId');
    const bim = this._parseBimestre(bimestre);
    const texto = this._normalizeObservacion(observacion);

    const repo = this.subjectEnrollmentBimesterRepository;
    const actualizadas = await repo.actualizarObservacionBimestreParaleloEstudiante({
      paraleloGestionId: pgId,
      estudianteId: estId,
      bimestre: bim,
      observacion: texto,
      usuarioId: usuarioId ?? null,
    });

    this.logger?.info?.('[Calificaciones] Observación centralizador guardada', {
      paraleloGestionId: pgId,
      estudianteId: estId,
      bimestre: bim,
      filas: actualizadas,
    });

    return {
      paraleloGestionId: pgId,
      estudianteId: estId,
      bimestre: bim,
      observacion: texto,
      filasActualizadas: actualizadas,
    };
  }

  _parseId(value, label) {
    const id = parseInt(String(value), 10);
    if (!Number.isFinite(id) || id < 1) {
      throw new ValidationError(`${label} inválido`);
    }
    return id;
  }

  _parseBimestre(value) {
    const bim = parseInt(String(value), 10);
    if (!Number.isFinite(bim) || bim < 1 || bim > 4) {
      throw new ValidationError('bimestre debe ser un entero entre 1 y 4');
    }
    return bim;
  }

  _normalizeObservacion(value) {
    if (value == null) return null;
    const texto = String(value).trim();
    if (!texto) return null;
    if (!VERDICTOS_OBSERVACION_BIMESTRE_VALUES.includes(texto)) {
      throw new ValidationError(
        `observacion debe ser uno de: ${VERDICTOS_OBSERVACION_BIMESTRE_VALUES.join(', ')}`,
      );
    }
    return texto;
  }
}

export default SaveObservacionCentralizadorBimestreUseCase;
