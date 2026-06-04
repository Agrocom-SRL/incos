import { NotFoundError, UnprocessableEntityError } from '../../../domain/errors/index.js';
import { DocenteGrillaConflictosPresentationMapper } from '../../mappers/horarios/DocenteGrillaConflictosPresentationMapper.js';

/**
 * GET /api/v1/horarios/docentes/:docenteId/grilla-conflictos?gestion_id=
 * Grilla semanal agregada del docente (todas las ofertas de la gestión) y pares de bloques en choque.
 */
export class GetDocenteGrillaConflictosUseCase {
  constructor({ teacherRepository, parallelRepository, logger }) {
    this.teacherRepository = teacherRepository;
    this.parallelRepository = parallelRepository;
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
    });

    return { grilla_conflictos: payload };
  }
}
