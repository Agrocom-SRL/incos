import { ValidationError } from '../../../domain/errors/index.js';
import { ESTADOS_PARALELO_GESTION } from '../../../domain/constants/oferta.constants.js';

const BLOQUEADOS = new Set([
  ESTADOS_PARALELO_GESTION.PUBLICADO,
  ESTADOS_PARALELO_GESTION.CERRADO,
]);

/**
 * @param {string|null|undefined} estado
 */
export function assertParaleloGestionHorarioEditable(estado) {
  const s = String(estado || '').trim().toUpperCase();
  if (BLOQUEADOS.has(s)) {
    throw new ValidationError(
      `No se pueden modificar bloques cuando el paralelo en gestión está en estado ${s}`
    );
  }
}
