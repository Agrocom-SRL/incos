import { QueryTypes } from 'sequelize';
import { sequelize } from '../../database/sequelize.js';
import { IParaleloGestionGrillaBloqueViewRepository } from '../../../domain/interfaces/repositories/IParaleloGestionGrillaBloqueViewRepository.js';

const VIEW = 'vista_base_paralelo_gestion_grilla_bloque';

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

function buildExcludeHorarioClause(excludeIds, column = 'asignacionHorarioId') {
  const ids = normalizeExcludeAsignacionHorarioIds(null, excludeIds);
  if (!ids.length) return { clause: '', replacements: {} };
  return {
    clause: `AND ${column} NOT IN (:excludeHorarioIds)`,
    replacements: { excludeHorarioIds: ids },
  };
}

/**
 * Lectura: vista_base_paralelo_gestion_grilla_bloque (03-views/122).
 */
export class ParaleloGestionGrillaBloqueViewRepository extends IParaleloGestionGrillaBloqueViewRepository {
  /**
   * @param {number} paraleloGestionId
   * @returns {Promise<Array<Object>>}
   */
  async findByParaleloGestionId(paraleloGestionId) {
    const pgId = Number(paraleloGestionId);
    if (!Number.isFinite(pgId) || pgId < 1) return [];

    return sequelize.query(
      `
      SELECT *
      FROM ${VIEW}
      WHERE paraleloGestionId = :paraleloGestionId
      ORDER BY
        FIELD(dia, 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'),
        horaInicio ASC,
        asignacionHorarioId ASC
      `,
      { replacements: { paraleloGestionId: pgId }, type: QueryTypes.SELECT }
    );
  }

  /**
   * @param {Object} params
   */
  async findByAssignmentAndHorario({
    asignacionDocenteId,
    horarioId,
    excludeAsignacionHorarioId = null,
    excludeAsignacionHorarioIds = null,
  }) {
    const adId = Number(asignacionDocenteId);
    const hId = Number(horarioId);
    const excludeIds = normalizeExcludeAsignacionHorarioIds(
      excludeAsignacionHorarioId,
      excludeAsignacionHorarioIds
    );
    if (!Number.isFinite(adId) || !Number.isFinite(hId)) return null;

    const { clause, replacements: excludeRepl } = buildExcludeHorarioClause(excludeIds);

    const rows = await sequelize.query(
      `
      SELECT asignacionHorarioId
      FROM ${VIEW}
      WHERE asignacionDocenteId = :asignacionDocenteId
        AND horarioId = :horarioId
        ${clause}
      LIMIT 1
      `,
      {
        replacements: {
          asignacionDocenteId: adId,
          horarioId: hId,
          ...excludeRepl,
        },
        type: QueryTypes.SELECT,
      }
    );
    return rows[0] ? Number(rows[0].asignacionHorarioId) : null;
  }

  /**
   * Otra asignación del mismo paralelo_gestion en el mismo horario_id.
   */
  async findOtherAssignmentAtHorario({
    paraleloGestionId,
    horarioId,
    asignacionDocenteId,
    excludeAsignacionHorarioId = null,
    excludeAsignacionHorarioIds = null,
  }) {
    const pgId = Number(paraleloGestionId);
    const hId = Number(horarioId);
    const adId = Number(asignacionDocenteId);
    const excludeIds = normalizeExcludeAsignacionHorarioIds(
      excludeAsignacionHorarioId,
      excludeAsignacionHorarioIds
    );
    if (!Number.isFinite(pgId) || !Number.isFinite(hId) || !Number.isFinite(adId)) return null;

    const { clause, replacements: excludeRepl } = buildExcludeHorarioClause(excludeIds);

    const rows = await sequelize.query(
      `
      SELECT asignacionDocenteId
      FROM ${VIEW}
      WHERE paraleloGestionId = :paraleloGestionId
        AND horarioId = :horarioId
        AND asignacionDocenteId <> :asignacionDocenteId
        ${clause}
      LIMIT 1
      `,
      {
        replacements: {
          paraleloGestionId: pgId,
          horarioId: hId,
          asignacionDocenteId: adId,
          ...excludeRepl,
        },
        type: QueryTypes.SELECT,
      }
    );
    return rows[0] ? Number(rows[0].asignacionDocenteId) : null;
  }
}
