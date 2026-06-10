import { QueryTypes } from 'sequelize';
import { IAsignacionHorarioRepository } from '../../domain/interfaces/repositories/IAsignacionHorarioRepository.js';
import { AsignacionHorario as AsignacionHorarioModel } from '../database/models/asignacion_horario.js';
import { sequelize } from '../database/sequelize.js';
import { BaseRepository } from './BaseRepository.js';
import { AsignacionHorarioMapper } from '../mappers/AsignacionHorarioMapper.js';

/**
 * Bloques horarios (asignacion_horarios) vinculados a asignaciones_docentes.
 * @implements {IAsignacionHorarioRepository}
 */
export class AsignacionHorarioRepository extends BaseRepository {
  getModel() {
    return AsignacionHorarioModel;
  }

  toEntity(model) {
    return AsignacionHorarioMapper.toEntity(model);
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.teacherAssignmentId) {
      where.asignacionDocenteId = filters.teacherAssignmentId;
    }
    if (filters.scheduleId) {
      where.horarioId = filters.scheduleId;
    }
    if (filters.classroomId) {
      where.aulaId = filters.classroomId;
    }
    if (filters.sequenceOrder !== undefined) {
      where.ordenSecuencia = filters.sequenceOrder;
    }
    return where;
  }

  getSearchFields() {
    return [];
  }

  getDefaultSort() {
    return [];
  }

  mapDataToModel(data, userId = null) {
    return AsignacionHorarioMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return AsignacionHorarioMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'asignacionHorarios';
  }

  /**
   * Bloques de una oferta (oferta_curso_id) para presentación.
   * @param {number} ofertaCursoId
   */
  async findBloquesByOfertaCursoIdForPresentation(ofertaCursoId) {
    const id = Number(ofertaCursoId);
    if (!Number.isFinite(id) || id < 1) return [];

    const sql = `
      SELECT
        b.id AS id,
        b.cursoId AS cursoId,
        b.ordenSecuencia AS ordenSecuencia,
        b.horarioId AS horarioId,
        b.horarioNombre AS horarioNombre,
        b.dia AS dia,
        b.horaInicio AS horaInicio,
        b.horaFin AS horaFin,
        b.turno AS turno,
        b.numeroBloque AS numeroBloque,
        b.aulaId AS aulaId,
        b.aulaCodigo AS aulaCodigo,
        b.aulaNombre AS aulaNombre
      FROM vista_base_curso_bloques_horario b
      WHERE b.cursoId = :ofertaCursoId
      ORDER BY b.ordenSecuencia ASC, b.id ASC
    `;

    return sequelize.query(sql, { replacements: { ofertaCursoId: id }, type: QueryTypes.SELECT });
  }

  async hasClassroomConflict({ scheduleId, classroomId, excludeAsignacionHorarioId = null }) {
    const excludeId = excludeAsignacionHorarioId;
    const conflictId = await this.findClassroomConflict({ scheduleId, classroomId, excludeAsignacionHorarioId: excludeId });
    return conflictId != null;
  }

  async findClassroomConflict({ scheduleId, classroomId, excludeAsignacionHorarioId = null }) {
    const sid = Number(scheduleId);
    const aid = Number(classroomId);
    const excludeId = excludeAsignacionHorarioId == null ? null : Number(excludeAsignacionHorarioId);
    if (!Number.isFinite(sid) || sid < 1 || !Number.isFinite(aid) || aid < 1) {
      return null;
    }

    const rows = await sequelize.query(
      `
      SELECT id
      FROM asignacion_horarios
      WHERE horario_id = :scheduleId
        AND aula_id = :classroomId
        AND deleted_at IS NULL
        AND activo = 1
        ${Number.isFinite(excludeId) && excludeId > 0 ? 'AND id <> :excludeId' : ''}
      ORDER BY id ASC
      LIMIT 1
      `,
      {
        replacements: {
          scheduleId: sid,
          classroomId: aid,
          ...(Number.isFinite(excludeId) && excludeId > 0 ? { excludeId } : {}),
        },
        type: QueryTypes.SELECT,
      }
    );
    return rows.length > 0 ? Number(rows[0].id) : null;
  }

  /**
   * Bloques vigentes de asignaciones para un conjunto de ofertas.
   * @param {number[]} ofertaCursoIds
   */
  async findRowsByOfertaCursoIds(ofertaCursoIds = []) {
    const ids = [...new Set(ofertaCursoIds.map((v) => Number(v)).filter((n) => Number.isFinite(n) && n > 0))];
    if (!ids.length) return [];

    return sequelize.query(
      `
      SELECT
        ah.id AS id,
        ad.oferta_curso_id AS ofertaCursoId,
        ah.asignacion_docente_id AS asignacionDocenteId,
        ah.horario_id AS horarioId,
        ah.orden_secuencia AS ordenSecuencia
      FROM asignacion_horarios ah
      INNER JOIN asignaciones_docentes ad ON ad.id = ah.asignacion_docente_id
        AND ad.deleted_at IS NULL
        AND ad.activo = TRUE
        AND ad.vigente = TRUE
      WHERE ad.oferta_curso_id IN (:ofertaCursoIds)
        AND ah.deleted_at IS NULL
        AND ah.activo = TRUE
      `,
      { replacements: { ofertaCursoIds: ids }, type: QueryTypes.SELECT }
    );
  }
}
