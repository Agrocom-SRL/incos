/**
 * GET /api/v1/paralelos-gestion/:id/grilla-horario
 */

import { NotFoundError } from '../../../domain/errors/index.js';
import { GrillaHorarioPresentationMapper } from '../../mappers/horarios/GrillaHorarioPresentationMapper.js';

export class GetParaleloGestionGrillaHorarioUseCase {
  constructor({ parallelManagementRepository, horarioGrillaRepository, scheduleRepository, logger }) {
    this.parallelManagementRepository = parallelManagementRepository;
    this.horarioGrillaRepository = horarioGrillaRepository;
    this.scheduleRepository = scheduleRepository;
    this.logger = logger;
  }

  /**
   * @param {number} paraleloGestionId
   */
  async execute(paraleloGestionId) {
    const pgId = Number(paraleloGestionId);
    if (!Number.isFinite(pgId) || pgId < 1) {
      throw new NotFoundError('Paralelo en gestión');
    }

    const detalle = await this.parallelManagementRepository.findEnrichedById(pgId);
    if (!detalle) {
      throw new NotFoundError('Paralelo en gestión', pgId);
    }

    const turno = detalle.turno ?? detalle.paraleloTurnoMaestro ?? null;

    const [
      bloques,
      coberturaRows,
      conflictosParalelo,
      conflictosAula,
      conflictosDocente,
      franjasCatalogo,
    ] = await Promise.all([
      this.horarioGrillaRepository.findBloquesByParaleloGestionId(pgId),
      this.horarioGrillaRepository.findCoberturaBloquesByParaleloGestionId(pgId),
      this.horarioGrillaRepository.findConflictosParaleloByParaleloGestionId(pgId),
      this.horarioGrillaRepository.findConflictosAulaByParaleloGestionId(pgId),
      this.horarioGrillaRepository.findConflictosDocenteByParaleloGestionId(pgId),
      this._loadFranjasCatalogo(turno),
    ]);

    const payload = GrillaHorarioPresentationMapper.toPresentation({
      paraleloGestionId: pgId,
      turno,
      bloques,
      coberturaRows,
      conflictosParalelo,
      conflictosAula,
      conflictosDocente,
      franjasCatalogo,
    });

    this.logger.info('[Horarios] Grilla paralelo_gestion', {
      paraleloGestionId: pgId,
      bloques: bloques.length,
      conflictos: payload.conflictos.length,
      coberturaCompleta: payload.cobertura.completa,
    });

    return payload;
  }

  /**
   * Catálogo horarios activos del turno (para resolver horario_id en franjas vacías de la grilla).
   * @param {string|null} turno
   */
  async _loadFranjasCatalogo(turno) {
    const shift = turno != null ? String(turno).trim() : '';
    if (!shift) return [];

    const result = await this.scheduleRepository.findAll(
      { shift, scheduleType: 'CLASES', active: true },
      { page: 1, limit: 500 },
      null
    );
    const rows = result?.schedules ?? [];
    return (rows || []).map((h) => {
      const plain = h.toPlainObject ? h.toPlainObject() : h;
      const hi = plain.startTime ?? plain.horaInicio;
      const hf = plain.endTime ?? plain.horaFin;
      return {
        horarioId: plain.id,
        dia: plain.day ?? plain.dia,
        horaInicio:
          hi != null && typeof hi === 'string'
            ? hi.slice(0, 5)
            : hi,
        horaFin:
          hf != null && typeof hf === 'string'
            ? hf.slice(0, 5)
            : hf,
        turno: plain.shift ?? plain.turno,
        numeroBloque: plain.blockNumber ?? plain.numeroBloque,
      };
    });
  }
}
