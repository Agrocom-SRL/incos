import { NotFoundError, UnprocessableEntityError } from '../../../domain/errors/index.js';
import { DocenteGrillaConflictosPresentationMapper } from '../../mappers/horarios/DocenteGrillaConflictosPresentationMapper.js';

/**
 * GET /api/v1/horarios/docentes/:docenteId/grilla-conflictos?gestion_id=
 * Grilla semanal agregada del docente (todas las ofertas de la gestión) y pares de bloques en choque.
 */
export class GetDocenteGrillaConflictosUseCase {
  constructor({ teacherRepository, parallelRepository, scheduleRepository, logger }) {
    this.teacherRepository = teacherRepository;
    this.parallelRepository = parallelRepository;
    this.scheduleRepository = scheduleRepository;
    this.logger = logger;
  }

  resolveGestionId(gestionIdRaw) {
    const id = Number(gestionIdRaw);
    if (!Number.isFinite(id) || id < 1) {
      throw new UnprocessableEntityError('gestion_id es obligatorio.', [
        { field: 'gestion_id', message: 'Debe ser un entero positivo' },
      ]);
    }
    return id;
  }

  /**
   * Catálogo horarios activos del turno (franjas válidas para mover bloques).
   * @param {string|null} turno
   */
  async _loadFranjasCatalogo(turno) {
    const shift = turno != null ? String(turno).trim() : '';
    if (!shift) return [];

    const result = await this.scheduleRepository.findAll(
      { shift, scheduleType: 'CLASES', active: true },
      { page: 1, limit: 500 },
      null,
    );
    const rows = result?.schedules ?? [];
    return (rows || []).map((h) => {
      const plain = h.toPlainObject ? h.toPlainObject() : h;
      const hi = plain.startTime ?? plain.horaInicio;
      const hf = plain.endTime ?? plain.horaFin;
      return {
        horarioId: plain.id,
        dia: plain.day ?? plain.dia,
        horaInicio: hi != null && typeof hi === 'string' ? hi.slice(0, 5) : hi,
        horaFin: hf != null && typeof hf === 'string' ? hf.slice(0, 5) : hf,
        turno: plain.shift ?? plain.turno,
      };
    });
  }

  async execute(docenteIdRaw, gestionIdRaw) {
    const docenteId = Number(docenteIdRaw);
    if (!Number.isFinite(docenteId) || docenteId < 1) {
      throw new NotFoundError('Docente');
    }

    const gestionId = this.resolveGestionId(gestionIdRaw);
    this.logger.info('[Horarios] Grilla conflictos docente', { docenteId, gestionId });

    const bundle = await this.teacherRepository.findGrillaConflictosByDocenteAndGestion(
      docenteId,
      gestionId,
    );
    if (!bundle?.teacher) {
      throw new NotFoundError('Docente');
    }

    const turnos = new Set();
    for (const row of bundle.scheduleRows || []) {
      const t = row.paralelo_turno ?? row.horario_turno;
      if (t != null && String(t).trim()) turnos.add(String(t).trim());
    }

    const catalogoFranjas = [];
    for (const turno of turnos) {
      const rows = await this._loadFranjasCatalogo(turno);
      catalogoFranjas.push(...rows);
    }

    const detalleRows = await this.parallelRepository.obtenerDocentesConflictosDetalleDashboard();
    const lineasDetalle = [];
    for (const r of detalleRows || []) {
      if (Number(r.docente_id) !== docenteId) continue;
      const line = String(r.detalle_linea || '').trim();
      if (line && !lineasDetalle.includes(line)) lineasDetalle.push(line);
    }

    const payload = DocenteGrillaConflictosPresentationMapper.toResponse({
      ...bundle,
      lineasDetalle,
      catalogoFranjas,
    });

    return { grilla_conflictos: payload };
  }
}
