import { ValidationError } from '../../../domain/errors/AppError.js';
import { parseIdOpcional } from '../../utils/validacionEntrada.js';

const TURNOS = ['MAÑANA', 'TARDE', 'NOCHE'];

/**
 * Normaliza body API (español/camelCase) a dominio Parallel.
 */
export function normalizeParaleloBody(body = {}) {
  const carreraId = body.carrera_id ?? body.carreraId;
  const periodoId = body.periodo_id ?? body.periodoId;
  const nombreRaw = body.nombre ?? body.name;
  const nombre = nombreRaw == null ? undefined : String(nombreRaw).trim();
  const turno = body.turno ?? body.shift;
  const descripcion = body.descripcion ?? body.description;
  const activo = body.activo ?? body.active;

  return {
    careerId: parseIdOpcional(carreraId, 'carrera_id'),
    periodId: parseIdOpcional(periodoId, 'periodo_id'),
    name: nombre,
    shift: turno,
    description: descripcion != null ? String(descripcion).trim() : undefined,
    active: activo,
  };
}

export function assertParaleloPayload(data, { requireAll = true } = {}) {
  if (requireAll || data.careerId != null) {
    if (!data.careerId || Number.isNaN(data.careerId)) {
      throw new ValidationError('carrera_id es requerido');
    }
  }
  if (requireAll || data.periodId != null) {
    if (!data.periodId || Number.isNaN(data.periodId)) {
      throw new ValidationError('periodo_id es requerido');
    }
  }
  if (requireAll || data.name !== undefined) {
    if (!data.name || data.name.length < 1) {
      throw new ValidationError('nombre es requerido');
    }
    if (data.name.length > 50) {
      throw new ValidationError('nombre no puede superar 50 caracteres');
    }
  }
  if (requireAll || data.shift != null) {
    if (!data.shift || !TURNOS.includes(data.shift)) {
      throw new ValidationError('turno debe ser MAÑANA, TARDE o NOCHE');
    }
  }
}
