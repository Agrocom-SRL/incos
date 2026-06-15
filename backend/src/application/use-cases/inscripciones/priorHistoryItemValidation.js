import { ValidationError } from '../../../domain/errors/AppError.js';
import { ESTADOS_HISTORIAL_PREVIO_VALUES } from '../../../domain/constants/evaluaciones.constants.js';

/**
 * Normaliza nota y estado de una fila de historial_previo.
 * CONVALIDADO: nota_final puede ser null.
 * APROBADO: nota obligatoria en rango 0–100 (mínimo de aprobación lo define el instituto en reglamento).
 */
export function parsePriorHistoryItem(item) {
  const materiaId = Number(item.materiaId ?? item.materia_id);
  const periodId = Number(item.periodId ?? item.period_id);
  const status = String(item.status ?? item.estado ?? 'APROBADO').toUpperCase();

  if (!materiaId || !periodId) {
    throw new ValidationError('Cada fila de historial previo requiere materia_id y period_id');
  }
  if (!ESTADOS_HISTORIAL_PREVIO_VALUES.includes(status)) {
    throw new ValidationError(
      `Estado de historial previo inválido. Valores: ${ESTADOS_HISTORIAL_PREVIO_VALUES.join(', ')}`
    );
  }

  let finalGrade = null;
  if (status === 'APROBADO') {
    const raw = item.finalGrade ?? item.final_grade ?? item.nota_final;
    finalGrade = Number(raw);
    if (Number.isNaN(finalGrade) || finalGrade < 0 || finalGrade > 100) {
      throw new ValidationError('La nota del historial previo debe estar entre 0 y 100');
    }
  } else {
    const raw = item.finalGrade ?? item.final_grade ?? item.nota_final;
    if (raw != null && raw !== '') {
      finalGrade = Number(raw);
      if (Number.isNaN(finalGrade) || finalGrade < 0 || finalGrade > 100) {
        throw new ValidationError('La nota del historial previo debe estar entre 0 y 100');
      }
    }
  }

  return { materiaId, periodId, finalGrade, status };
}
