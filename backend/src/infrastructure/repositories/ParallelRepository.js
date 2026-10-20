import { QueryTypes } from 'sequelize';
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
 * - Infrastructure Layer: Implementación concreta de IParaleloRepository
 * - Usa ParallelMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {IParaleloRepository}
 *
 * Esta clase cumple con el contrato IParaleloRepository:
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

  mapDataToModel(data, _userId = null) {
    return ParallelMapper.toModel(data);
  }

  mapDataToUpdate(data, _userId = null) {
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
        e.paralelo_gestion_id,
        e.paralelo_id,
        e.paralelo_nombre,
        e.turno,
        e.carrera_id,
        e.carrera_nombre,
        e.carrera_color_hex,
        e.periodo_nombre,
        e.paralelo_gestion_estado,
        e.paralelo_aula_id,
        e.asignaturas_requeridas,
        e.cursos_creados,
        e.cursos_con_horario,
        e.ofertas_cobertura_incompleta,
        e.cursos_sin_docente,
        e.bloques_sin_aula,
        e.conflictos_solape_mismo_bloque,
        e.conflictos_aula,
        e.conflicto_docente_horario,
        e.cantidad_docentes,
        e.cantidad_estudiantes,
        e.tablero_grupo
      FROM vista_horarios_paralelo_estado e
      ${where.length ? `WHERE ${where.map((w) => w.replace(/^(\w+)/, 'e.$1')).join(' AND ')}` : ''}
      ORDER BY e.carrera_nombre ASC, e.periodo_nombre ASC, e.paralelo_nombre ASC
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
    // Vista: 91-vista-base-cursos-choque-docente-horario-por-paralelo.sql
    return sequelize.query(
      `SELECT DISTINCT curso_id
       FROM vista_base_cursos_choque_docente_horario_por_paralelo
       WHERE paralelo_id = :paraleloId`,
      { replacements: { paraleloId: pid }, type: QueryTypes.SELECT }
    );
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
    // Vista: 96-vista-dashboard-docentes-conflictos-detalle.sql
    return sequelize.query(
      `SELECT
         docente_id,
         docente_nombre,
         detalle_linea,
         paralelo_gestion_id,
         oferta_curso_id,
         tipo_conflicto
       FROM vista_dashboard_docentes_conflictos_detalle
       ORDER BY docente_nombre ASC, detalle_linea ASC`,
      { type: QueryTypes.SELECT }
    );
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
        paralelo_gestion_id,
        paralelo_gestion_estado,
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
        horas_plan,
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

  /**
   * Métricas del tablero (vista 87) por paralelo_gestion_id — publicación / validaciones.
   * @param {number[]} paraleloGestionIds
   */
  async obtenerEstadoParaleloGestionPorIds(paraleloGestionIds = []) {
    const ids = [...new Set(
      (paraleloGestionIds || [])
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && id > 0),
    )];
    if (!ids.length) return new Map();

    const rows = await sequelize.query(
      `SELECT
         e.paralelo_gestion_id,
         e.paralelo_aula_id,
         e.asignaturas_requeridas,
         e.cursos_creados,
         e.cursos_con_horario,
         e.ofertas_cobertura_incompleta,
         e.cursos_sin_docente,
         e.bloques_sin_aula,
         e.conflictos_solape_mismo_bloque,
         e.conflictos_aula,
         e.conflicto_docente_horario,
         e.tablero_grupo
       FROM vista_horarios_paralelo_estado e
       WHERE e.paralelo_gestion_id IN (:ids)`,
      { replacements: { ids }, type: QueryTypes.SELECT },
    );

    return new Map(rows.map((r) => [Number(r.paralelo_gestion_id), r]));
  }

  /**
   * Cabecera del paralelo (vista 87) por paralelo_gestion_id — metadatos de
   * encabezado para reportes (carrera, periodo/curso, paralelo, turno, gestión).
   * Reutiliza `vista_horarios_paralelo_estado`; no crea ni duplica vistas.
   * @param {number} paraleloGestionId
   * @returns {Promise<Object|null>}
   */
  async obtenerCabeceraParaleloGestion(paraleloGestionId) {
    const pgId = Number(paraleloGestionId);
    if (!Number.isFinite(pgId) || pgId < 1) return null;

    const rows = await sequelize.query(
      `SELECT
         e.paralelo_gestion_id,
         e.paralelo_id,
         e.paralelo_nombre,
         e.turno,
         e.carrera_id,
         e.carrera_nombre,
         e.carrera_color_hex,
         e.periodo_nombre,
         e.paralelo_gestion_estado
       FROM vista_horarios_paralelo_estado e
       WHERE e.paralelo_gestion_id = :pgId
       LIMIT 1`,
      { replacements: { pgId }, type: QueryTypes.SELECT }
    );

    return rows?.[0] ?? null;
  }

  /**
   * Paralelos de una carrera en la gestión vigente (vista 87). La vista
   * `vista_horarios_paralelo_estado` ya está acotada a la gestión vigente (grano
   * paralelo_gestion), por lo que solo se filtra por carrera. Devuelve los
   * metadatos de cabecera más los conteos de estudiantes/docentes para que el
   * consumidor (centralizador por carrera) sepa qué paralelos tienen matrícula.
   * No crea ni duplica vistas.
   * @param {number} carreraId
   * @returns {Promise<Array<Object>>}
   */
  async listarParalelosPorCarreraGestionVigente(carreraId) {
    const cId = Number(carreraId);
    if (!Number.isFinite(cId) || cId < 1) return [];

    return sequelize.query(
      `SELECT
         e.paralelo_gestion_id,
         e.paralelo_id,
         e.paralelo_nombre,
         e.turno,
         e.carrera_id,
         e.carrera_nombre,
         e.periodo_nombre,
         e.cantidad_estudiantes,
         e.cantidad_docentes
       FROM vista_horarios_paralelo_estado e
       WHERE e.carrera_id = :cId
       ORDER BY e.periodo_nombre ASC, e.paralelo_nombre ASC`,
      { replacements: { cId }, type: QueryTypes.SELECT }
    );
  }
}
