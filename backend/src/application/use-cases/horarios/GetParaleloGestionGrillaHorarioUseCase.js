/**
 * GET /api/v1/paralelos-gestion/:id/grilla-horario
 */

import { NotFoundError } from '../../../domain/errors/index.js';
import { GrillaHorarioPresentationMapper } from '../../mappers/horarios/GrillaHorarioPresentationMapper.js';

export class GetParaleloGestionGrillaHorarioUseCase {
  constructor({ parallelManagementRepository, horarioGrillaRepository, logger }) {
    this.parallelManagementRepository = parallelManagementRepository;
    this.horarioGrillaRepository = horarioGrillaRepository;
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

    const [
      bloques,
      coberturaRows,
      conflictosParalelo,
      conflictosAula,
      conflictosDocente,
    ] = await Promise.all([
      this.horarioGrillaRepository.findBloquesByParaleloGestionId(pgId),
      this.horarioGrillaRepository.findCoberturaBloquesByParaleloGestionId(pgId),
      this.horarioGrillaRepository.findConflictosParaleloByParaleloGestionId(pgId),
      this.horarioGrillaRepository.findConflictosAulaByParaleloGestionId(pgId),
      this.horarioGrillaRepository.findConflictosDocenteByParaleloGestionId(pgId),
    ]);

    const payload = GrillaHorarioPresentationMapper.toPresentation({
      paraleloGestionId: pgId,
      turno: detalle.turno ?? detalle.paraleloTurnoMaestro ?? null,
      bloques,
      coberturaRows,
      conflictosParalelo,
      conflictosAula,
      conflictosDocente,
    });

    this.logger.info('[Horarios] Grilla paralelo_gestion', {
      paraleloGestionId: pgId,
      bloques: bloques.length,
      conflictos: payload.conflictos.length,
      coberturaCompleta: payload.cobertura.completa,
    });

    return payload;
  }
}
