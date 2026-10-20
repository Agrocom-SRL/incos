import { Op } from 'sequelize';
import { Estudiante as EstudianteModel } from '../database/models/estudiante.js';
import { BaseRepository } from './BaseRepository.js';
import { StudentMapper } from '../mappers/StudentMapper.js';
import { sequelize } from '../database/sequelize.js';

/**
 * Implementación del repositorio de estudiantes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a StudentMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa StudentMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IEstudianteRepository
 * - Usa StudentMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {IEstudianteRepository}
 *
 * Esta clase cumple con el contrato IEstudianteRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 */
export class StudentRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de estudiantes
   * @returns {Object} Modelo Estudiante
   */
  getModel() {
    return EstudianteModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a StudentMapper
   *
   * @param {Object} model - Modelo Sequelize
   * @returns {Student|null} Entidad de dominio
   */
  toEntity(model) {
    return StudentMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Student
   *
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   *
   * Ejemplos de uso:
   * - findBy({ ci: '1234567', expedition: 'LP' }) → Busca por CI y expedición
   * - findBy({ studentCode: '2025-001' }) → Busca por código de estudiante
   * - findAll({ userId: 1 }) → Busca estudiantes de un usuario
   * - findAll({ gender: 'M' }) → Busca por género
   *
   * @param {Object} filters - Filtros de búsqueda
   *   - ci: Cédula de identidad
   *   - expedition: Expedición del CI (se convierte a mayúsculas)
   *   - studentCode: Código del estudiante (codigoEstudiante)
   *   - personalEmail: Email personal (se convierte a minúsculas)
   *   - userId: ID del usuario
   *   - gender: Género
   *   - hasDisability: Si tiene discapacidad (true/false)
   *   - excludeId: ID a excluir de la búsqueda (ej: al actualizar, excluir el propio estudiante para validar CI único)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Excluir un ID de la búsqueda (ej: validar CI único en actualización excluyendo al actual)
    const excludeId = filters.excludeId != null && !Number.isNaN(Number(filters.excludeId))
      ? Number(filters.excludeId)
      : null;
    if (excludeId !== null) {
      where.id = { [Op.ne]: excludeId };
    }

    // Criterios de búsqueda únicos (para findBy)
    if (filters.ci) {
      where.ci = filters.ci;
    }
    if (filters.expedicion !== undefined) {
      // Mismo criterio que otros campos: valor tal cual (null o '' permitidos); solo normalizar strings no vacíos
      where.expedicion = (filters.expedicion !== null && String(filters.expedicion).trim() !== '')
        ? String(filters.expedicion).trim().toUpperCase()
        : filters.expedicion;
    }
    if (filters.studentCode) {
      where.codigoEstudiante = filters.studentCode;
    }
    if (filters.personalEmail) {
      where.emailPersonal = filters.personalEmail.toLowerCase();
    }

    // Filtros generales (para findAll)
    if (filters.userId) {
      where.usuarioId = filters.userId;
    }
    if (filters.gender) {
      where.genero = filters.gender;
    }
    if (filters.hasDisability !== undefined) {
      where.tieneDiscapacidad = filters.hasDisability;
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
    return ['codigoEstudiante', 'nombres', 'apellidoPaterno', 'apellidoMaterno', 'ci', 'emailPersonal'];
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

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a StudentMapper
   *
   * @param {Student|Object} data - Entidad Student o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, _userId = null) {
    return StudentMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a StudentMapper
   *
   * @param {Student|Object} data - Entidad Student o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, _userId = null) {
    return StudentMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'students';
  }

  /**
   * Obtiene datos personales completos del estudiante desde vista_estudiante_datos_personales.
   * Consulta directa a la vista (torso + piezas 09–14). Retorna objetos planos, no entidades.
   *
   * @param {Object} filters - Filtros opcionales (datos que diferencian a cada estudiante)
   *   - id: ID del estudiante
   *   - codigo_estudiante: Código único del estudiante
   *   - ci: Cédula de identidad (usar junto con expedicion para identificación única)
   *   - expedicion: Expedición del CI (SC, LP, CB, etc.)
   * @returns {Promise<Array>} Array de objetos planos con datos enriquecidos
   */
  async obtenerDatosPersonales(filters = {}) {
    const whereConditions = [];
    const replacements = [];

    if (filters.id !== undefined) {
      whereConditions.push('id = ?');
      replacements.push(filters.id);
    }
    if (filters.codigo_estudiante !== undefined) {
      whereConditions.push('codigo_estudiante = ?');
      replacements.push(filters.codigo_estudiante);
    }
    if (filters.ci !== undefined) {
      whereConditions.push('ci = ?');
      replacements.push(filters.ci);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const query = `
      SELECT *
      FROM vista_estudiante_datos_personales
      ${whereClause}
      ORDER BY id ASC
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    return results;
  }

  /**
   * Lista estudiantes desde vista_estudiante_datos_personales con paginación y búsqueda.
   * Usado por ListStudentsUseCase para devolver datos enriquecidos (residencia, estado civil, etc.) y datos de trabajo.
   *
   * @param {Object} filters - Filtros (search, sort)
   *   - search: Término de búsqueda (LIKE en nombres, apellidos, codigo_estudiante, ci)
   *   - sort: Orden (ej. "id:ASC", "nombres:ASC")
   * @param {number} page - Página (1-based)
   * @param {number} limit - Límite por página
   * @returns {Promise<{students: Object[], total: number, page: number, limit: number}>}
   */
  async listFromView(filters = {}, page = 1, limit = 50) {
    const whereConditions = [];
    const replacements = [];

    if (filters.search && String(filters.search).trim() !== '') {
      const term = `%${String(filters.search).trim()}%`;
      whereConditions.push(
        '(nombres LIKE ? OR apellido_paterno LIKE ? OR apellido_materno LIKE ? OR codigo_estudiante LIKE ? OR ci LIKE ?)'
      );
      replacements.push(term, term, term, term, term);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Por defecto: más recientes primero (created_at DESC)
    let orderBy = 'created_at DESC';
    if (filters.sort && String(filters.sort).trim() !== '') {
      const [field, dir] = filters.sort.split(':');
      const direction = (dir || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      const allowedSort = ['id', 'nombres', 'apellido_paterno', 'apellido_materno', 'codigo_estudiante', 'ci', 'created_at'];
      if (field && allowedSort.includes(field)) {
        orderBy = `${field} ${direction}`;
      }
    }

    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM vista_estudiante_datos_personales
      ${whereClause}
    `;
    const countResult = await sequelize.query(countQuery, {
      replacements: [...replacements],
      type: sequelize.QueryTypes.SELECT,
    });
    const total = Number(countResult[0]?.total ?? 0);

    const dataQuery = `
      SELECT *
      FROM vista_estudiante_datos_personales
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    const rows = await sequelize.query(dataQuery, {
      replacements: [...replacements, limit, offset],
      type: sequelize.QueryTypes.SELECT,
    });

    return {
      students: rows,
      total,
      page,
      limit,
    };
  }

  /**
   * Búsqueda o muestra previa para registro de aporte (vista_estudiante_busqueda_registro_aporte).
   *
   * @param {Object} options
   * @param {boolean} [options.preliminar=false] - Si true: estudiantes con cabeceras_con_saldo > 0, sin texto
   * @param {string} [options.q] - Término LIKE (contacto, CI, código, nombres, carrera); mín. 2 caracteres si no es preliminar
   * @param {number} [options.limit=50] - Máximo de filas (1–100)
   * @returns {Promise<Array<Object>>} Filas planas con cabeceras_con_saldo, cabeceras_total, carrera_nombre
   */
  async buscarParaRegistroAporte(options = {}) {
    const { preliminar = false, q, limit = 50 } = options;
    const lim = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

    if (preliminar) {
      const queryPrelim = `
        SELECT *
        FROM vista_estudiante_busqueda_registro_aporte b
        WHERE COALESCE(b.cabeceras_con_saldo, 0) > 0
        ORDER BY b.created_at DESC
        LIMIT ?
      `;
      return sequelize.query(queryPrelim, {
        replacements: [lim],
        type: sequelize.QueryTypes.SELECT,
      });
    }

    const raw = String(q ?? '').trim();
    if (raw.length < 2) {
      return [];
    }
    const safe = raw.replace(/%/g, '').replace(/_/g, '');
    const term = `%${safe}%`;
    const tokens = safe
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2)
      .slice(0, 6);
    const tokenClauses = tokens.map(
      () => '(COALESCE(b.nombres, \'\') LIKE ? OR COALESCE(b.apellido_paterno, \'\') LIKE ? OR COALESCE(b.apellido_materno, \'\') LIKE ? OR CONCAT_WS(\' \', b.nombres, b.apellido_paterno, b.apellido_materno) LIKE ? OR CONCAT_WS(\' \', b.apellido_paterno, b.apellido_materno, b.nombres) LIKE ? OR COALESCE(b.carrera_nombre, \'\') LIKE ? OR COALESCE(b.carrera_codigo, \'\') LIKE ? OR COALESCE(b.codigo_estudiante, \'\') LIKE ? OR COALESCE(b.ci, \'\') LIKE ?)'
    );
    const tokenSql = tokenClauses.length > 0 ? ` AND ${tokenClauses.join(' AND ')}` : '';

    const query = `
      SELECT *
      FROM vista_estudiante_busqueda_registro_aporte b
      WHERE (
          COALESCE(b.email_personal, '') LIKE ?
          OR COALESCE(b.celular, '') LIKE ?
          OR COALESCE(b.telefono_fijo, '') LIKE ?
          OR COALESCE(b.codigo_estudiante, '') LIKE ?
          OR COALESCE(b.ci, '') LIKE ?
          OR COALESCE(b.nombres, '') LIKE ?
          OR COALESCE(b.apellido_paterno, '') LIKE ?
          OR COALESCE(b.apellido_materno, '') LIKE ?
          OR CONCAT_WS(' ', b.nombres, b.apellido_paterno, b.apellido_materno) LIKE ?
          OR CONCAT_WS(' ', b.apellido_paterno, b.apellido_materno, b.nombres) LIKE ?
          OR COALESCE(b.carrera_nombre, '') LIKE ?
          OR COALESCE(b.carrera_codigo, '') LIKE ?
        )
      ${tokenSql}
      ORDER BY CASE WHEN COALESCE(b.cabeceras_con_saldo, 0) > 0 THEN 0 ELSE 1 END, b.created_at DESC
      LIMIT ?
    `;

    const replacements = [term, term, term, term, term, term, term, term, term, term, term, term];
    for (const tk of tokens) {
      const tokenLike = `%${tk}%`;
      replacements.push(
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike
      );
    }
    replacements.push(lim);

    return sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
  }

  /**
   * Búsqueda o muestra previa para asignar beca (vista_estudiante_busqueda_asignacion_beca).
   * Excluye estudiantes con beca ACTIVA o PENDIENTE en la gestión vigente.
   *
   * @param {Object} options
   * @param {boolean} [options.preliminar=false] - Si true: muestra recientes sin texto de búsqueda
   * @param {string} [options.q] - Término LIKE; mín. 2 caracteres si no es preliminar
   * @param {number} [options.limit=50] - Máximo de filas (1–100)
   * @returns {Promise<Array<Object>>}
   */
  async buscarParaAsignacionBeca(options = {}) {
    const { preliminar = false, q, limit = 50 } = options;
    const lim = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

    if (preliminar) {
      const queryPrelim = `
        SELECT *
        FROM vista_estudiante_busqueda_asignacion_beca b
        ORDER BY b.created_at DESC
        LIMIT ?
      `;
      return sequelize.query(queryPrelim, {
        replacements: [lim],
        type: sequelize.QueryTypes.SELECT,
      });
    }

    const raw = String(q ?? '').trim();
    if (raw.length < 2) {
      return [];
    }
    const safe = raw.replace(/%/g, '').replace(/_/g, '');
    const term = `%${safe}%`;
    const tokens = safe
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2)
      .slice(0, 6);
    const tokenClauses = tokens.map(
      () =>
        '(COALESCE(b.nombres, \'\') LIKE ? OR COALESCE(b.apellido_paterno, \'\') LIKE ? OR COALESCE(b.apellido_materno, \'\') LIKE ? OR CONCAT_WS(\' \', b.nombres, b.apellido_paterno, b.apellido_materno) LIKE ? OR CONCAT_WS(\' \', b.apellido_paterno, b.apellido_materno, b.nombres) LIKE ? OR COALESCE(b.carrera_nombre, \'\') LIKE ? OR COALESCE(b.carrera_codigo, \'\') LIKE ? OR COALESCE(b.codigo_estudiante, \'\') LIKE ? OR COALESCE(b.ci, \'\') LIKE ?)'
    );
    const tokenSql = tokenClauses.length > 0 ? ` AND ${tokenClauses.join(' AND ')}` : '';

    const querySql = `
      SELECT *
      FROM vista_estudiante_busqueda_asignacion_beca b
      WHERE (
          COALESCE(b.email_personal, '') LIKE ?
          OR COALESCE(b.celular, '') LIKE ?
          OR COALESCE(b.telefono_fijo, '') LIKE ?
          OR COALESCE(b.codigo_estudiante, '') LIKE ?
          OR COALESCE(b.ci, '') LIKE ?
          OR COALESCE(b.nombres, '') LIKE ?
          OR COALESCE(b.apellido_paterno, '') LIKE ?
          OR COALESCE(b.apellido_materno, '') LIKE ?
          OR CONCAT_WS(' ', b.nombres, b.apellido_paterno, b.apellido_materno) LIKE ?
          OR CONCAT_WS(' ', b.apellido_paterno, b.apellido_materno, b.nombres) LIKE ?
          OR COALESCE(b.carrera_nombre, '') LIKE ?
          OR COALESCE(b.carrera_codigo, '') LIKE ?
        )
      ${tokenSql}
      ORDER BY b.created_at DESC
      LIMIT ?
    `;

    const replacements = [term, term, term, term, term, term, term, term, term, term, term, term];
    for (const tk of tokens) {
      const tokenLike = `%${tk}%`;
      replacements.push(
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike
      );
    }
    replacements.push(lim);

    return sequelize.query(querySql, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
  }

  /**
   * Búsqueda o muestra previa para el wizard de Inscripción nueva
   * (vista_estudiante_busqueda_inscripcion).
   * NO excluye a los ya matriculados en la gestión vigente: los prioriza al
   * final (ORDER BY) y la vista expone inscripcion_gestion_actual_id para que
   * el use case anote yaMatriculadoGestionActual.
   * Prioridad del ORDER BY (misma que aplica la lista del paso «Buscar»):
   * 1) sin matrícula en la gestión vigente, 2) nuevos en el sistema
   * (total_inscripciones = 0), 3) registro más reciente.
   *
   * @param {Object} options
   * @param {boolean} [options.preliminar=false] - Si true: muestra recientes sin texto de búsqueda
   * @param {boolean} [options.soloNuevos=false] - Si true: solo estudiantes con
   *   total_inscripciones = 0 (nuevos en el sistema), orden created_at DESC;
   *   no exige texto de búsqueda (q opcional)
   * @param {string} [options.q] - Término LIKE; mín. 2 caracteres si no es preliminar/soloNuevos
   * @param {number} [options.limit=50] - Máximo de filas (1–100)
   * @returns {Promise<Array<Object>>}
   */
  async buscarParaInscripcion(options = {}) {
    const { preliminar = false, soloNuevos = false, q, limit = 50 } = options;
    const lim = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

    if (soloNuevos) {
      return this._buscarSoloNuevosParaInscripcion({ q, lim });
    }

    if (preliminar) {
      const queryPrelim = `
        SELECT *
        FROM vista_estudiante_busqueda_inscripcion b
        ORDER BY
          CASE WHEN b.inscripcion_gestion_actual_id IS NULL THEN 0 ELSE 1 END,
          CASE WHEN COALESCE(b.total_inscripciones, 0) = 0 THEN 0 ELSE 1 END,
          b.created_at DESC
        LIMIT ?
      `;
      return sequelize.query(queryPrelim, {
        replacements: [lim],
        type: sequelize.QueryTypes.SELECT,
      });
    }

    const raw = String(q ?? '').trim();
    if (raw.length < 2) {
      return [];
    }
    const safe = raw.replace(/%/g, '').replace(/_/g, '');
    const term = `%${safe}%`;
    const tokens = safe
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2)
      .slice(0, 6);
    const tokenClauses = tokens.map(
      () =>
        '(COALESCE(b.nombres, \'\') LIKE ? OR COALESCE(b.apellido_paterno, \'\') LIKE ? OR COALESCE(b.apellido_materno, \'\') LIKE ? OR CONCAT_WS(\' \', b.nombres, b.apellido_paterno, b.apellido_materno) LIKE ? OR CONCAT_WS(\' \', b.apellido_paterno, b.apellido_materno, b.nombres) LIKE ? OR COALESCE(b.carrera_nombre, \'\') LIKE ? OR COALESCE(b.carrera_codigo, \'\') LIKE ? OR COALESCE(b.codigo_estudiante, \'\') LIKE ? OR COALESCE(b.ci, \'\') LIKE ?)'
    );
    const tokenSql = tokenClauses.length > 0 ? ` AND ${tokenClauses.join(' AND ')}` : '';

    const querySql = `
      SELECT *
      FROM vista_estudiante_busqueda_inscripcion b
      WHERE (
          COALESCE(b.email_personal, '') LIKE ?
          OR COALESCE(b.celular, '') LIKE ?
          OR COALESCE(b.telefono_fijo, '') LIKE ?
          OR COALESCE(b.codigo_estudiante, '') LIKE ?
          OR COALESCE(b.ci, '') LIKE ?
          OR COALESCE(b.nombres, '') LIKE ?
          OR COALESCE(b.apellido_paterno, '') LIKE ?
          OR COALESCE(b.apellido_materno, '') LIKE ?
          OR CONCAT_WS(' ', b.nombres, b.apellido_paterno, b.apellido_materno) LIKE ?
          OR CONCAT_WS(' ', b.apellido_paterno, b.apellido_materno, b.nombres) LIKE ?
          OR COALESCE(b.carrera_nombre, '') LIKE ?
          OR COALESCE(b.carrera_codigo, '') LIKE ?
        )
      ${tokenSql}
      ORDER BY
        CASE WHEN b.inscripcion_gestion_actual_id IS NULL THEN 0 ELSE 1 END,
        CASE WHEN COALESCE(b.total_inscripciones, 0) = 0 THEN 0 ELSE 1 END,
        b.created_at DESC
      LIMIT ?
    `;

    const replacements = [term, term, term, term, term, term, term, term, term, term, term, term];
    for (const tk of tokens) {
      const tokenLike = `%${tk}%`;
      replacements.push(
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike,
        tokenLike
      );
    }
    replacements.push(lim);

    return sequelize.query(querySql, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
  }

  /**
   * Modo solo_nuevos del wizard de Inscripción nueva: estudiantes sin ninguna
   * inscripción activa en cualquier gestión (total_inscripciones = 0 en la
   * vista 153), orden created_at DESC (los recién registrados primero).
   * Si llega un término q (≥ 2 caracteres) se filtra además por LIKE.
   *
   * @private
   * @param {{ q?: string, lim: number }} params
   * @returns {Promise<Array<Object>>}
   */
  async _buscarSoloNuevosParaInscripcion({ q, lim }) {
    const raw = String(q ?? '').trim();
    const safe = raw.replace(/%/g, '').replace(/_/g, '');
    const hasTerm = safe.length >= 2;
    const term = `%${safe}%`;

    const searchSql = hasTerm
      ? `AND (
          COALESCE(b.codigo_estudiante, '') LIKE ?
          OR COALESCE(b.ci, '') LIKE ?
          OR COALESCE(b.nombres, '') LIKE ?
          OR COALESCE(b.apellido_paterno, '') LIKE ?
          OR COALESCE(b.apellido_materno, '') LIKE ?
          OR CONCAT_WS(' ', b.nombres, b.apellido_paterno, b.apellido_materno) LIKE ?
          OR CONCAT_WS(' ', b.apellido_paterno, b.apellido_materno, b.nombres) LIKE ?
        )`
      : '';

    const querySql = `
      SELECT *
      FROM vista_estudiante_busqueda_inscripcion b
      WHERE b.total_inscripciones = 0
      ${searchSql}
      ORDER BY b.created_at DESC
      LIMIT ?
    `;

    const replacements = hasTerm ? [term, term, term, term, term, term, term, lim] : [lim];

    return sequelize.query(querySql, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
  }
}
