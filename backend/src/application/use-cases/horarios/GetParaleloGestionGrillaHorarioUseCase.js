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
      paraleloGestionEstado: detalle.state ?? detalle.estado ?? null,
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
   * Catálogo de horarios activos disponibles para la grilla del paralelo
   * (para resolver horario_id en franjas vacías y en el armado por arrastre).
   *
   * Modelo de negocio: las franjas L–V pertenecen al turno del paralelo
   * (TARDE/NOCHE). El sábado NO está atado a un turno (`horarios.turno IS NULL`):
   * es un día comodín compartido por todos los turnos, que se ofrece para
   * extender la carga horaria cuando L–V no alcanza. Por eso se carga aparte y
   * se suma al catálogo del turno, sin importar el turno del paralelo.
   *
   * @param {string|null} turno
   */
  async _loadFranjasCatalogo(turno) {
    const shift = turno != null ? String(turno).trim() : '';
    if (!shift) return [];

    const [turnoResult, sabadoResult] = await Promise.all([
      this.scheduleRepository.findAll(
        { shift, scheduleType: 'CLASES', active: true },
        { page: 1, limit: 500 },
        null
      ),
      this.scheduleRepository.findAll(
        { day: 'SABADO', scheduleType: 'CLASES', active: true },
        { page: 1, limit: 500 },
        null
      ),
    ]);

    const rows = [
      ...(turnoResult?.schedules ?? []),
      ...(sabadoResult?.schedules ?? []),
    ];

    const seen = new Set();
    const franjas = [];
    for (const h of rows) {
      const plain = h.toPlainObject ? h.toPlainObject() : h;
      if (!seen.has(plain.id)) {
        seen.add(plain.id);
        const hi = plain.startTime ?? plain.horaInicio;
        const hf = plain.endTime ?? plain.horaFin;
        franjas.push({
          horarioId: plain.id,
          dia: plain.day ?? plain.dia,
          horaInicio: hi != null && typeof hi === 'string' ? hi.slice(0, 5) : hi,
          horaFin: hf != null && typeof hf === 'string' ? hf.slice(0, 5) : hf,
          turno: plain.shift ?? plain.turno,
          numeroBloque: plain.blockNumber ?? plain.numeroBloque,
        });
      }
    }
    return franjas;
  }
}
