import { QueryTypes } from 'sequelize';
import { IParallelRepository } from '../../domain/interfaces/repositories/IParallelRepository.js';
import { Paralelo as ParaleloModel } from '../database/models/paralelo.js';
import { BaseRepository } from './BaseRepository.js';
import { ParallelMapper } from '../mappers/ParallelMapper.js';
import { sequelize } from '../database/sequelize.js';

/**
 * Implementación del repositorio de paralelos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ParallelMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ParallelMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IParallelRepository
 * - Usa ParallelMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IParallelRepository}
 * 
 * Esta clase cumple con el contrato IParallelRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 */
export class ParallelRepository extends BaseRepository {
  getModel() {
    return ParaleloModel;
  }

  toEntity(model) {
    return ParallelMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Parallel
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ careerId: 1 }) → Busca paralelos de una carrera
   * - findAll({ periodId: 2, shift: 'MAÑANA' }) → Busca paralelos de un periodo y turno
   * - findBy({ careerId: 1, periodId: 2, name: 'A' }) → Busca paralelo específico
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - careerId: ID de la carrera
   *   - periodId: ID del periodo
   *   - name: Nombre del paralelo (búsqueda exacta, para búsqueda de texto usar search())
   *   - shift: Turno (MAÑANA, TARDE, NOCHE)
   *   - description: Descripción (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.careerId) {
      where.carreraId = filters.careerId;
    }
    if (filters.periodId) {
      where.periodoId = filters.periodId;
    }
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.shift) {
      where.turno = filters.shift;
    }
    if (filters.description !== undefined) {
      where.descripcion = filters.description;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda de texto
   * Estos campos se usan en el método search() para búsqueda por término
   * 
   * @returns {string[]} Array de nombres de campos del modelo Sequelize
   */
  getSearchFields() {
    return ['nombre', 'descripcion'];
  }

  /**
   * Retorna el orden por defecto para las consultas
   * Delega el orden al BaseRepository que ordena por ID ASC
   * 
   * @returns {Array} Array vacío para usar el orden por defecto del BaseRepository (id ASC)
   */
  getDefaultSort() {
    return []; // Usa el orden por defecto de BaseRepository: [['id', 'ASC']]
  }

  mapDataToModel(data, userId = null) {
    return ParallelMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return ParallelMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'parallels';
  }

  /**
   * Obtiene estadísticas de inscripción por paralelo para una gestión y datos del periodo.
   * Consulta la vista vista_paralelos_estadisticas_gestion_resueltas
   * (backend/database/03-views/57-vista-paralelos-estadisticas-gestion-resueltas.sql).
   *
   * @param {number[]} parallelIds - IDs de paralelos
   * @param {number} managementId - ID de la gestión académica
   * @returns {Promise<Array>} Array de objetos planos: paralelo_id, total_inscritos, total_hombres, total_mujeres, periodo_numero, periodo_nombre
   */
  async obtenerEstadisticasYPeriodoPorGestion(parallelIds, managementId) {
    if (!Array.isArray(parallelIds) || parallelIds.length === 0) {
      return [];
    }

    const placeholders = parallelIds.map(() => '?').join(',');
    const query = `
      SELECT
        paralelo_id,
        gestion_id,
        total_inscritos,
        total_hombres,
        total_mujeres,
        periodo_numero,
        periodo_nombre
      FROM vista_paralelos_estadisticas_gestion_resueltas
      WHERE paralelo_id IN (${placeholders})
        AND gestion_id = ?
    `;

    const results = await sequelize.query(query, {
      replacements: [...parallelIds, managementId],
      type: sequelize.QueryTypes.SELECT,
    });

    return results;
  }

  async obtenerParalelosEstadoDashboard(filters = {}) {
    const where = [];
    const replacements = {};

    if (filters.carrera_id != null) {
      where.push('carrera_id = :carrera_id');
      replacements.carrera_id = Number(filters.carrera_id);
    }
    if (filters.turno) {
      where.push('turno = :turno');
      replacements.turno = String(filters.turno).toUpperCase();
    }

    const query = `
      SELECT
        paralelo_id,
        paralelo_nombre,
        turno,
        carrera_id,
        carrera_nombre,
        carrera_color_hex,
        periodo_nombre,
        asignaturas_requeridas,
        cursos_creados,
        cursos_con_horario,
        cursos_sin_docente,
        bloques_sin_aula,
        conflictos_solape_mismo_bloque,
        conflictos_aula,
        conflicto_docente_horario,
        tablero_grupo
      FROM vista_horarios_paralelo_estado
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY carrera_nombre ASC, periodo_nombre ASC, paralelo_nombre ASC
    `;

    return sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
  }

  /**
   * Cursos del paralelo con docente asignado en conflicto de horario (misma franja en dos cursos del mismo docente).
   * @param {number} paraleloId
   * @returns {Promise<Array<{ curso_id: number }>>}
   */
  async obtenerCursoIdsChoqueDocenteHorarioPorParalelo(paraleloId) {
    const pid = Number(paraleloId);
    if (!Number.isFinite(pid) || pid < 1) {
      return [];
    }
    const query = `
      SELECT DISTINCT c1.id AS curso_id
      FROM cursos c1
      INNER JOIN asignaciones_docentes ad1
        ON ad1.curso_id = c1.id
        AND ad1.deleted_at IS NULL
        AND ad1.activo = TRUE
        AND ad1.vigente = TRUE
        AND ad1.docente_id IS NOT NULL
      INNER JOIN cursos_horarios ch1
        ON ch1.curso_id = c1.id
        AND ch1.deleted_at IS NULL
        AND ch1.activo = TRUE
        AND ch1.horario_id IS NOT NULL
      INNER JOIN asignaciones_docentes ad2
        ON ad2.docente_id = ad1.docente_id
        AND ad2.id <> ad1.id
        AND ad2.deleted_at IS NULL
        AND ad2.activo = TRUE
        AND ad2.vigente = TRUE
        AND ad2.docente_id IS NOT NULL
      INNER JOIN cursos_horarios ch2
        ON ch2.curso_id = ad2.curso_id
        AND ch2.horario_id = ch1.horario_id
        AND ch2.deleted_at IS NULL
        AND ch2.activo = TRUE
      WHERE c1.paralelo_id = :paraleloId
        AND c1.deleted_at IS NULL
        AND c1.activo = TRUE
    `;
    return sequelize.query(query, {
      replacements: { paraleloId: pid },
      type: QueryTypes.SELECT,
    });
  }

  async obtenerAsignaturasSinCursoDashboard() {
    const query = `
      SELECT
        carrera_id,
        carrera_nombre,
        periodo_id,
        periodo_nombre,
        materia_sigla,
        materia_nombre,
        horas_semanales
      FROM vista_horarios_asignaturas_sin_curso
      ORDER BY carrera_nombre ASC, periodo_nombre ASC, materia_nombre ASC
    `;
    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
  }

  async obtenerCapacidadTurnoDashboard() {
    const query = `
      SELECT
        turno,
        aulas_en_uso,
        total_aulas,
        porcentaje_ocupacion
      FROM vista_horarios_capacidad_turno
      ORDER BY turno ASC
    `;
    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
  }

  async obtenerBloquesSinAulaDashboard() {
    const query = `
      SELECT
        curso_horario_id,
        curso_id,
        curso_codigo,
        materia_sigla,
        materia_nombre,
        paralelo_id,
        paralelo_nombre,
        paralelo_turno,
        periodo_nombre,
        carrera_id,
        carrera_nombre,
        dia,
        hora_inicio,
        hora_fin,
        orden_secuencia
      FROM vista_bloques_horarios_sin_aula
      ORDER BY
        carrera_nombre ASC,
        periodo_nombre ASC,
        paralelo_turno ASC,
        paralelo_nombre ASC,
        materia_sigla ASC,
        dia ASC,
        hora_inicio ASC
    `;
    return sequelize.query(query, { type: QueryTypes.SELECT });
  }

  async obtenerCursosSinDocenteDashboard() {
    const query = `
      SELECT
        curso_id,
        curso_codigo,
        materia_sigla,
        materia_nombre,
        paralelo_id,
        paralelo_nombre,
        paralelo_turno,
        periodo_nombre,
        carrera_id,
        carrera_nombre
      FROM vista_horarios_cursos_sin_docente
      ORDER BY
        carrera_nombre ASC,
        periodo_nombre ASC,
        paralelo_turno ASC,
        paralelo_nombre ASC,
        materia_sigla ASC
    `;
    return sequelize.query(query, { type: QueryTypes.SELECT });
  }

  async obtenerDocentesConflictosDetalleDashboard() {
    const query = `
      (
        SELECT DISTINCT
          ad.docente_id,
          TRIM(CONCAT(COALESCE(d.nombres, ''), ' ', COALESCE(d.apellido_paterno, ''), ' ', COALESCE(d.apellido_materno, ''))) AS docente_nombre,
          CONCAT(
            COALESCE(NULLIF(TRIM(m.sigla), ''), m.nombre, c.codigo, '—'),
            ' · ',
            UPPER(COALESCE(h.dia, '')),
            ' ',
            LEFT(COALESCE(TIME_FORMAT(h.hora_inicio, '%H:%i'), ''), 5),
            '-',
            LEFT(COALESCE(TIME_FORMAT(h.hora_fin, '%H:%i'), ''), 5),
            ' · ',
            COALESCE(p.nombre, ''),
            CASE
              WHEN p.turno IS NOT NULL AND TRIM(COALESCE(p.turno, '')) <> '' THEN CONCAT(' · ', p.turno)
              ELSE ''
            END
          ) AS detalle_linea
        FROM vista_base_docente_asignacion_conflicto_horario conf
        INNER JOIN asignaciones_docentes ad
          ON ad.id = conf.asignacion_docente_id
          AND ad.deleted_at IS NULL
          AND ad.activo = TRUE
          AND ad.vigente = TRUE
        INNER JOIN docentes d
          ON d.id = ad.docente_id
          AND d.deleted_at IS NULL
          AND d.activo = TRUE
        INNER JOIN cursos c
          ON c.id = ad.curso_id
          AND c.deleted_at IS NULL
          AND c.activo = TRUE
        INNER JOIN cursos_horarios ch
          ON ch.curso_id = c.id
          AND ch.deleted_at IS NULL
          AND ch.activo = TRUE
        INNER JOIN horarios h
          ON h.id = ch.horario_id
          AND h.deleted_at IS NULL
          AND h.activo = TRUE
        INNER JOIN paralelos p
          ON p.id = c.paralelo_id
          AND p.deleted_at IS NULL
          AND p.activo = TRUE
        LEFT JOIN asignaturas_plan ap
          ON ap.id = c.asignatura_plan_id
          AND ap.deleted_at IS NULL
          AND ap.activo = TRUE
        LEFT JOIN materias m
          ON m.id = ap.materia_id
          AND m.deleted_at IS NULL
          AND m.activo = TRUE
      )
      UNION ALL
      (
        SELECT DISTINCT
          ad.docente_id,
          TRIM(CONCAT(COALESCE(d.nombres, ''), ' ', COALESCE(d.apellido_paterno, ''), ' ', COALESCE(d.apellido_materno, ''))) AS docente_nombre,
          CONCAT(
            COALESCE(NULLIF(TRIM(m.sigla), ''), m.nombre, c.codigo, '—'),
            ' · ',
            UPPER(COALESCE(h.dia, '')),
            ' ',
            LEFT(COALESCE(TIME_FORMAT(h.hora_inicio, '%H:%i'), ''), 5),
            '-',
            LEFT(COALESCE(TIME_FORMAT(h.hora_fin, '%H:%i'), ''), 5),
            ' · Aula ',
            COALESCE(NULLIF(TRIM(au.codigo), ''), au.nombre, 'sin código')
          ) AS detalle_linea
        FROM vista_base_docente_asignacion_conflicto_aula conf
        INNER JOIN asignaciones_docentes ad
          ON ad.id = conf.asignacion_docente_id
          AND ad.deleted_at IS NULL
          AND ad.activo = TRUE
          AND ad.vigente = TRUE
        INNER JOIN docentes d
          ON d.id = ad.docente_id
          AND d.deleted_at IS NULL
          AND d.activo = TRUE
        INNER JOIN cursos c
          ON c.id = ad.curso_id
          AND c.deleted_at IS NULL
          AND c.activo = TRUE
        INNER JOIN cursos_horarios ch
          ON ch.curso_id = c.id
          AND ch.deleted_at IS NULL
          AND ch.activo = TRUE
          AND ch.aula_id IS NOT NULL
        INNER JOIN horarios h
          ON h.id = ch.horario_id
          AND h.deleted_at IS NULL
          AND h.activo = TRUE
        INNER JOIN aulas au
          ON au.id = ch.aula_id
          AND au.deleted_at IS NULL
          AND au.activo = TRUE
        INNER JOIN paralelos p
          ON p.id = c.paralelo_id
          AND p.deleted_at IS NULL
          AND p.activo = TRUE
        LEFT JOIN asignaturas_plan ap
          ON ap.id = c.asignatura_plan_id
          AND ap.deleted_at IS NULL
          AND ap.activo = TRUE
        LEFT JOIN materias m
          ON m.id = ap.materia_id
          AND m.deleted_at IS NULL
          AND m.activo = TRUE
      )
      UNION ALL
      (
        SELECT DISTINCT
          ad.docente_id,
          TRIM(CONCAT(COALESCE(d.nombres, ''), ' ', COALESCE(d.apellido_paterno, ''), ' ', COALESCE(d.apellido_materno, ''))) AS docente_nombre,
          CONCAT(
            'Asignación duplicada · ',
            COALESCE(NULLIF(TRIM(m.sigla), ''), m.nombre, c.codigo, '—'),
            ' · ',
            COALESCE(p.nombre, ''),
            CASE
              WHEN p.turno IS NOT NULL AND TRIM(COALESCE(p.turno, '')) <> '' THEN CONCAT(' · ', p.turno)
              ELSE ''
            END
          ) AS detalle_linea
        FROM vista_base_docente_asignacion_conflicto_curso conf
        INNER JOIN asignaciones_docentes ad
          ON ad.id = conf.asignacion_docente_id
          AND ad.deleted_at IS NULL
          AND ad.activo = TRUE
          AND ad.vigente = TRUE
        INNER JOIN docentes d
          ON d.id = ad.docente_id
          AND d.deleted_at IS NULL
          AND d.activo = TRUE
        INNER JOIN cursos c
          ON c.id = ad.curso_id
          AND c.deleted_at IS NULL
          AND c.activo = TRUE
        INNER JOIN paralelos p
          ON p.id = c.paralelo_id
          AND p.deleted_at IS NULL
          AND p.activo = TRUE
        LEFT JOIN asignaturas_plan ap
          ON ap.id = c.asignatura_plan_id
          AND ap.deleted_at IS NULL
          AND ap.activo = TRUE
        LEFT JOIN materias m
          ON m.id = ap.materia_id
          AND m.deleted_at IS NULL
          AND m.activo = TRUE
      )
      ORDER BY docente_nombre ASC, detalle_linea ASC
    `;
    return sequelize.query(query, { type: QueryTypes.SELECT });
  }

  /**
   * @param {{ carrera_id?: number|null, turno?: string|null, periodo?: string|null }} filters
   */
  async obtenerPublicacionBloques(filters = {}) {
    const where = [];
    const replacements = {};

    if (filters.carrera_id != null && Number.isFinite(Number(filters.carrera_id))) {
      where.push('carrera_id = :carrera_id');
      replacements.carrera_id = Number(filters.carrera_id);
    }
    if (filters.turno) {
      where.push('UPPER(paralelo_turno) = UPPER(:turno)');
      replacements.turno = String(filters.turno);
    }
    if (filters.periodo) {
      where.push('periodo_nombre = :periodo');
      replacements.periodo = String(filters.periodo);
    }

    const query = `
      SELECT
        paralelo_id,
        paralelo_nombre,
        paralelo_turno,
        carrera_id,
        carrera_nombre,
        carrera_codigo,
        carrera_color_hex,
        periodo_nombre,
        curso_id,
        curso_codigo,
        curso_color_hex,
        materia_id,
        materia_sigla,
        materia_nombre,
        docente_nombre,
        curso_horario_id,
        horario_id,
        dia,
        hora_inicio,
        hora_fin,
        orden_secuencia,
        aula_id,
        aula_codigo,
        aula_nombre
      FROM vista_horarios_publicacion_bloque
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY
        carrera_nombre ASC,
        periodo_nombre ASC,
        paralelo_turno ASC,
        paralelo_nombre ASC,
        curso_id ASC,
        orden_secuencia ASC,
        curso_horario_id ASC
    `;

    return sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });
  }
}
