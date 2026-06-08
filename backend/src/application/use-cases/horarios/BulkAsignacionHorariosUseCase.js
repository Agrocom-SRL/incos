import { ValidationError } from '../../../domain/errors/index.js';
import { CreateAsignacionHorarioUseCase } from './CreateAsignacionHorarioUseCase.js';
import { UpdateAsignacionHorarioUseCase } from './UpdateAsignacionHorarioUseCase.js';
import { DeleteAsignacionHorarioUseCase } from './DeleteAsignacionHorarioUseCase.js';

function normalizeOp(item) {
  return String(item?.op || item?.operacion || 'create').toLowerCase();
}

function itemId(item) {
  return Number(item?.id ?? item?.asignacion_horario_id);
}

function itemHorarioId(item) {
  return Number(item?.horario_id ?? item?.horarioId);
}

/**
 * Excluye bloques que se reubican en el mismo bulk (p. ej. intercambio de franjas).
 */
async function buildBatchExcludeMap(items, asignacionHorarioRepository) {
  const updates = items
    .map((item, index) => ({ index, item, op: normalizeOp(item) }))
    .filter(({ op }) => op === 'update' || op === 'actualizar');

  const currentHorarioById = new Map();
  for (const { item } of updates) {
    const id = itemId(item);
    if (!Number.isFinite(id) || id < 1) continue;
    const existing = await asignacionHorarioRepository.findById(id);
    if (existing?.scheduleId != null) {
      currentHorarioById.set(id, Number(existing.scheduleId));
    }
  }

  const excludesByIndex = new Map();
  for (const { index, item } of updates) {
    const id = itemId(item);
    const targetHorarioId = itemHorarioId(item);
    const excludes = Number.isFinite(id) && id > 0 ? [id] : [];

    if (Number.isFinite(targetHorarioId) && targetHorarioId > 0) {
      for (const [otherId, oldHorarioId] of currentHorarioById) {
        if (otherId === id) continue;
        if (oldHorarioId === targetHorarioId) excludes.push(otherId);
      }
    }

    excludesByIndex.set(index, [...new Set(excludes.filter((n) => Number.isFinite(n) && n > 0))]);
  }

  return excludesByIndex;
}

export class BulkAsignacionHorariosUseCase {
  constructor({
    createAsignacionHorarioUseCase,
    updateAsignacionHorarioUseCase,
    deleteAsignacionHorarioUseCase,
    asignacionHorarioRepository,
    logger,
  }) {
    this.createAsignacionHorarioUseCase = createAsignacionHorarioUseCase;
    this.updateAsignacionHorarioUseCase = updateAsignacionHorarioUseCase;
    this.deleteAsignacionHorarioUseCase = deleteAsignacionHorarioUseCase;
    this.asignacionHorarioRepository = asignacionHorarioRepository;
    this.logger = logger;
  }

  async execute(body, userId = null) {
    const items = Array.isArray(body?.items) ? body.items : Array.isArray(body) ? body : null;
    if (!items?.length) {
      throw new ValidationError('Se requiere un array `items` con al menos una operación');
    }

    const coberturaReajuste =
      body?.cobertura_reajuste === true || body?.coberturaReajuste === true;
    const batchExcludes = await buildBatchExcludeMap(items, this.asignacionHorarioRepository);
    const resultados = [];

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i] || {};
      const op = normalizeOp(item);

      try {
        if (op === 'delete' || op === 'eliminar') {
          const id = item.id ?? item.asignacion_horario_id;
          const out = await this.deleteAsignacionHorarioUseCase.execute(id, userId, {
            coberturaReajuste,
          });
          resultados.push({ index: i, op: 'delete', success: true, data: out });
        } else if (op === 'update' || op === 'actualizar') {
          const id = item.id ?? item.asignacion_horario_id;
          const excludeIds = batchExcludes.get(i) ?? (Number.isFinite(Number(id)) ? [Number(id)] : []);
          const out = await this.updateAsignacionHorarioUseCase.execute(
            id,
            {
              ...item,
              _exclude_asignacion_horario_ids: excludeIds,
            },
            userId
          );
          resultados.push({ index: i, op: 'update', success: true, data: out });
        } else {
          const out = await this.createAsignacionHorarioUseCase.execute(
            coberturaReajuste ? { ...item, cobertura_reajuste: true } : item,
            userId,
          );
          resultados.push({ index: i, op: 'create', success: true, data: out });
        }
      } catch (e) {
        resultados.push({
          index: i,
          op,
          success: false,
          error: e.message,
          details: e.details ?? null,
        });
        this.logger.warn('[Horarios] bulk item falló', { index: i, op, message: e.message });
      }
    }

    const ok = resultados.every((r) => r.success);

    return {
      completo: ok,
      resultados,
    };
  }
}
