/**
 * Mapper de aplicación: EvaluationType → presentación API (español).
 */

export function entityToPresentation(evaluationType) {
  if (!evaluationType) return null;

  return {
    id: evaluationType.id,
    codigo: evaluationType.code,
    nombre: evaluationType.name,
    descripcion: evaluationType.description ?? null,
    ambito: evaluationType.scope,
    esRecuperatorio: Boolean(evaluationType.isRecovery),
    permiteMultiplesIntentos: Boolean(evaluationType.allowsMultipleAttempts),
    activo: evaluationType.active,
  };
}

export function entitiesToPresentation(evaluationTypes) {
  if (!Array.isArray(evaluationTypes)) return [];
  return evaluationTypes.map(entityToPresentation);
}

export class EvaluationTypePresentationMapper {
  static entityToPresentation(evaluationType) {
    return entityToPresentation(evaluationType);
  }

  static entitiesToPresentation(evaluationTypes) {
    return entitiesToPresentation(evaluationTypes);
  }
}

export default EvaluationTypePresentationMapper;
