import { QueryTypes } from 'sequelize';
import { sequelize } from '../../database/sequelize.js';
import { IAulasHorariosSemanaRepository } from '../../../domain/interfaces/repositories/IAulasHorariosSemanaRepository.js';

function buildWhere(filters = {}) {
  const where = [];
  const replacements = {};

  if (filters.day) {
    where.push('dia = :dia');
    replacements.dia = filters.day;
  }
  if (filters.shift) {
    where.push('turno = :turno');
    replacements.turno = filters.shift;
  }
  if (filters.classroomId) {
    where.push('aula_id = :aulaId');
    replacements.aulaId = filters.classroomId;
  }

  return {
    whereClause: where.length ? `WHERE ${where.join(' AND ')}` : '',
    replacements,
  };
}

export class AulasHorariosSemanaRepository extends IAulasHorariosSemanaRepository {
  async findAll(filters = {}, page = null, limit = null) {
    const { whereClause, replacements } = buildWhere(filters);
    const sql = `
      SELECT *
      FROM vista_aulas_horarios_semana
      ${whereClause}
      ORDER BY
        FIELD(dia, 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'),
        hora_inicio ASC,
        aula_codigo ASC,
        curso_horario_id ASC
    `;
    const bloques = await sequelize.query(sql, { replacements, type: QueryTypes.SELECT });
    return { bloques, total: bloques.length, page: 1, limit: bloques.length };
  }

  /**
   * Paralelos/cursos que usan un aula (bloques reales asignados, sin depender
   * de semana/gestión). Filtra `tiene_aula = 1` y descarta `es_sin_aula`.
   * La deduplicación por paralelo_id se hace en el use case consumidor.
   */
  async findByAulaId(aulaId) {
    const sql = `
      SELECT DISTINCT
        paralelo_id,
        paralelo_nombre,
        paralelo_turno,
        materia_id,
        materia_sigla,
        materia_nombre,
        carrera_id,
        carrera_nombre,
        docente_nombre
      FROM vista_aulas_horarios_semana
      WHERE aula_id = :aulaId
        AND tiene_aula = 1
        AND es_sin_aula = 0
      ORDER BY paralelo_nombre ASC
    `;
    return sequelize.query(sql, { replacements: { aulaId }, type: QueryTypes.SELECT });
  }
}
