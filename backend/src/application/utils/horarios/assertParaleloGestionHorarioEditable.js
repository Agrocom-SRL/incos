import { ValidationError } from '../../../domain/errors/index.js';
import { ESTADOS_PARALELO_GESTION } from '../../../domain/constants/oferta.constants.js';

const BLOQUEADOS_EDICION_COMPLETA = new Set([
  ESTADOS_PARALELO_GESTION.PUBLICADO,
  ESTADOS_PARALELO_GESTION.CERRADO,
]);

const BLOQUEADOS_REUBICACION = new Set([ESTADOS_PARALELO_GESTION.CERRADO]);
const BLOQUEADOS_COBERTURA_REAJUSTE = new Set([ESTADOS_PARALELO_GESTION.CERRADO]);

/**
 * Alta, baja y generación de bloques (no aplica a reubicar franjas en plan publicado).
 * @param {string|null|undefined} estado
 */
export function assertParaleloGestionHorarioEditable(estado) {
  const s = String(estado || '').trim().toUpperCase();
  if (BLOQUEADOS_EDICION_COMPLETA.has(s)) {
    throw new ValidationError(
      `No se pueden crear ni eliminar bloques cuando el paralelo en gestión está en estado ${s}`
    );
  }
}

/**
 * Alinear bloques con la carga horaria del plan (alta/baja permitida en PUBLICADO).
 * @param {string|null|undefined} estado
 */
export function assertParaleloGestionCoberturaReajustable(estado) {
  const s = String(estado || '').trim().toUpperCase();
  if (BLOQUEADOS_COBERTURA_REAJUSTE.has(s)) {
    throw new ValidationError(
      `No se puede reajustar la cobertura cuando el paralelo en gestión está en estado ${s}`
    );
  }
}

/**
 * Actualizar horario/aula de un bloque existente (permite PUBLICADO).
 * @param {string|null|undefined} estado
 */
export function assertParaleloGestionHorarioReubicable(estado) {
  const s = String(estado || '').trim().toUpperCase();
  if (BLOQUEADOS_REUBICACION.has(s)) {
    throw new ValidationError(
      `No se pueden reubicar bloques cuando el paralelo en gestión está en estado ${s}`
    );
  }
}
