import { ValidationError } from '../../../domain/errors/index.js';
import { CreateAsignacionHorarioUseCase } from './CreateAsignacionHorarioUseCase.js';
import { UpdateAsignacionHorarioUseCase } from './UpdateAsignacionHorarioUseCase.js';
import { DeleteAsignacionHorarioUseCase } from './DeleteAsignacionHorarioUseCase.js';

export class BulkAsignacionHorariosUseCase {
  constructor({
    createAsignacionHorarioUseCase,
    updateAsignacionHorarioUseCase,
    deleteAsignacionHorarioUseCase,
    logger,
  }) {
    this.createAsignacionHorarioUseCase = createAsignacionHorarioUseCase;
    this.updateAsignacionHorarioUseCase = updateAsignacionHorarioUseCase;
    this.deleteAsignacionHorarioUseCase = deleteAsignacionHorarioUseCase;
    this.logger = logger;
  }

  async execute(body, userId = null) {
    const items = Array.isArray(body?.items) ? body.items : Array.isArray(body) ? body : null;
    if (!items?.length) {
      throw new ValidationError('Se requiere un array `items` con al menos una operación');
    }

    const resultados = [];

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i] || {};
      const op = String(item.op || item.operacion || 'create').toLowerCase();

      try {
        if (op === 'delete' || op === 'eliminar') {
          const id = item.id ?? item.asignacion_horario_id;
          const out = await this.deleteAsignacionHorarioUseCase.execute(id, userId);
          resultados.push({ index: i, op: 'delete', success: true, data: out });
        } else if (op === 'update' || op === 'actualizar') {
          const id = item.id ?? item.asignacion_horario_id;
          const out = await this.updateAsignacionHorarioUseCase.execute(id, item, userId);
          resultados.push({ index: i, op: 'update', success: true, data: out });
        } else {
          const out = await this.createAsignacionHorarioUseCase.execute(item, userId);
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
