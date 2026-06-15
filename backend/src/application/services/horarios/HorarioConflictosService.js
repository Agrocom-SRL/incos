import { GrillaHorarioPresentationMapper } from '../../mappers/horarios/GrillaHorarioPresentationMapper.js';

function parseIdList(raw) {
  if (raw == null || raw === '') return [];
  return String(raw)
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function normalizeExcludeAsignacionHorarioIds(primaryId, extraIds = null) {
  const set = new Set();
  const add = (value) => {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) set.add(n);
  };
  add(primaryId);
  if (Array.isArray(extraIds)) {
    for (const id of extraIds) add(id);
  }
  return [...set];
}

/**
 * Motor de conflictos operativos por paralelo_gestion (vistas 124–126 + grilla 122).
 */
export class HorarioConflictosService {
  constructor({
    grillaBloqueViewRepository,
    conflictoParaleloBloqueViewRepository,
    conflictoAulaBloqueViewRepository,
    conflictoDocenteBloqueViewRepository,
    teacherAssignmentRepository,
    parallelManagementRepository,
  }) {
    this.grillaBloqueViewRepository = grillaBloqueViewRepository;
    this.conflictoParaleloBloqueViewRepository = conflictoParaleloBloqueViewRepository;
    this.conflictoAulaBloqueViewRepository = conflictoAulaBloqueViewRepository;
    this.conflictoDocenteBloqueViewRepository = conflictoDocenteBloqueViewRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.parallelManagementRepository = parallelManagementRepository;
  }

  /**
   * @param {number} paraleloGestionId
   */
  async listarConflictosParaleloGestion(paraleloGestionId) {
    const pgId = Number(paraleloGestionId);
    const [conflictosParalelo, conflictosAula, conflictosDocente] = await Promise.all([
      this.conflictoParaleloBloqueViewRepository.findByParaleloGestionId(pgId),
      this.conflictoAulaBloqueViewRepository.findByParaleloGestionId(pgId),
      this.conflictoDocenteBloqueViewRepository.findByParaleloGestionId(pgId),
    ]);

    return GrillaHorarioPresentationMapper.toPresentation({
      paraleloGestionId: pgId,
      turno: null,
      bloques: [],
      coberturaRows: [],
      conflictosParalelo,
      conflictosAula,
      conflictosDocente,
    }).conflictos;
  }

  /**
   * @param {Object} params
   * @param {number} params.asignacionDocenteId
   * @param {number} params.horarioId
   * @param {number|null} [params.excludeAsignacionHorarioId]
   * @param {number[]|null} [params.excludeAsignacionHorarioIds]
   */
  async validarPropuesta({
    asignacionDocenteId,
    horarioId,
    excludeAsignacionHorarioId = null,
    excludeAsignacionHorarioIds = null,
  }) {
    const adId = Number(asignacionDocenteId);
    const hId = Number(horarioId);
    const conflictos = [];
    const excludeIds = normalizeExcludeAsignacionHorarioIds(
      excludeAsignacionHorarioId,
      excludeAsignacionHorarioIds
    );

    const assignment = await this.teacherAssignmentRepository.findEnrichedById(adId);
    if (!assignment || !assignment.vigente) {
      return {
        valido: false,
        conflictos: [{ tipo: 'VALIDACION', mensaje: 'Asignación docente no vigente' }],
      };
    }

    const pgId = Number(assignment.paralelo_gestion_id);
    const pg = await this.parallelManagementRepository.findById(pgId);
    if (!pg) {
      return {
        valido: false,
        conflictos: [{ tipo: 'VALIDACION', mensaje: 'Paralelo en gestión no encontrado' }],
      };
    }

    if (!Number.isFinite(hId) || hId < 1) {
      return {
        valido: false,
        conflictos: [{ tipo: 'VALIDACION', mensaje: 'horario_id inválido' }],
      };
    }

    const dupSame = await this.grillaBloqueViewRepository.findByAssignmentAndHorario({
      asignacionDocenteId: adId,
      horarioId: hId,
      excludeAsignacionHorarioIds: excludeIds,
    });
    if (dupSame) {
      conflictos.push({
        tipo: 'VALIDACION',
        horario_id: hId,
        asignaciones_involucradas: [adId],
        mensaje: 'La asignación ya tiene un bloque en ese horario',
      });
    }

    const otherAd = await this.grillaBloqueViewRepository.findOtherAssignmentAtHorario({
      paraleloGestionId: pgId,
      horarioId: hId,
      asignacionDocenteId: adId,
      excludeAsignacionHorarioIds: excludeIds,
    });
    if (otherAd) {
      conflictos.push({
        tipo: 'PARALELO',
        horario_id: hId,
        asignaciones_involucradas: [adId, otherAd],
        mensaje: 'Otra materia del paralelo ya ocupa este bloque horario',
      });
    }

    const aulaEfectiva = Number(pg.classroomId ?? pg.aulaId);

    if (Number.isFinite(aulaEfectiva) && aulaEfectiva > 0) {
      const aulaRows = await this.conflictoAulaBloqueViewRepository.findByParaleloGestionId(pgId);
      for (const row of aulaRows) {
        if (Number(row.horarioId) !== hId) continue;
        if (Number(row.aulaId) !== aulaEfectiva) continue;
        const ids = parseIdList(row.asignacionIds);
        const others = ids.filter((id) => id !== adId);
        if (others.length > 0) {
          conflictos.push({
            tipo: 'AULA',
            horario_id: hId,
            aula_id: aulaEfectiva,
            asignaciones_involucradas: [adId, ...others],
            mensaje: 'La misma aula está asignada a más de una materia en el mismo bloque',
          });
          break;
        }
      }
    }

    const docRows = await this.conflictoDocenteBloqueViewRepository.findByParaleloGestionId(pgId);
    for (const row of docRows) {
      if (Number(row.horarioId) !== hId) continue;
      const id1 = Number(row.asignacionId1);
      const id2 = Number(row.asignacionId2);
      if (id1 === adId || id2 === adId) {
        const other = id1 === adId ? id2 : id1;
        conflictos.push({
          tipo: 'DOCENTE',
          horario_id: hId,
          asignaciones_involucradas: [adId, other],
          mensaje: `${(row.docenteNombre || 'Docente').trim()} tiene dos materias en el mismo bloque horario`,
        });
        break;
      }
    }

    return { valido: conflictos.length === 0, conflictos };
  }
}
