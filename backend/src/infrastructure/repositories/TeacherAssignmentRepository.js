import { IAsignacionDocenteRepository } from '../../domain/interfaces/repositories/IAsignacionDocenteRepository.js';
import { AsignacionDocente as AsignacionDocenteModel } from '../database/models/asignacion_docente.js';
import { sequelize } from '../database/sequelize.js';
import { QueryTypes } from 'sequelize';
import { BaseRepository } from './BaseRepository.js';
import { TeacherAssignmentMapper } from '../mappers/TeacherAssignmentMapper.js';

/**
 * Implementación del repositorio de asignaciones de docentes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a TeacherAssignmentMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa TeacherAssignmentMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IAsignacionDocenteRepository
 * - Usa TeacherAssignmentMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IAsignacionDocenteRepository}
 * 
 * Esta clase cumple con el contrato IAsignacionDocenteRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 */
export class TeacherAssignmentRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de asignaciones de docentes
   * @returns {Object} Modelo AsignacionDocente
   */
  getModel() {
    return AsignacionDocenteModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a TeacherAssignmentMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {TeacherAssignment|null} Entidad de dominio
   */
  toEntity(model) {
    return TeacherAssignmentMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad TeacherAssignment
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ teacherId: 1 }) → Busca asignaciones de un docente
   * - findAll({ courseId: 2, active: true }) → Busca asignaciones activas de un curso
   * - findBy({ managementPlanId: 1, courseId: 2, teacherId: 3 }) → Busca asignación específica
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - managementPlanId: ID del plan habilitado
   *   - courseId: ID del curso
   *   - teacherId: ID del docente
   *   - hours: Carga horaria
   *   - active: Si la asignación está vigente (true/false)
   *   - reason: Motivo de la asignación (búsqueda exacta, para búsqueda de texto usar search())
   *   - assignmentDate: Fecha de asignación
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.managementPlanId) {
      where.gestionPlanId = filters.managementPlanId;
    }
    if (filters.offerCourseId) {
      where.ofertaCursoId = filters.offerCourseId;
    }
    if (filters.courseId) {
      where.ofertaCursoId = filters.courseId;
    }
    if (filters.teacherId) {
      where.docenteId = filters.teacherId;
    }
    if (filters.hours !== undefined) {
      where.cargaHoraria = filters.hours;
    }
    if (filters.active !== undefined) {
      where.vigente = filters.active;
    }
    if (filters.reason !== undefined) {
      where.motivo = filters.reason;
    }
    if (filters.assignmentDate !== undefined) {
      where.fechaAsignacion = filters.assignmentDate;
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
    return ['motivo'];
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
   * Delega la responsabilidad de mapeo a TeacherAssignmentMapper
   * 
   * @param {TeacherAssignment|Object} data - Entidad TeacherAssignment o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return TeacherAssignmentMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a TeacherAssignmentMapper
   * 
   * @param {TeacherAssignment|Object} data - Entidad TeacherAssignment o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return TeacherAssignmentMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'teacherAssignments';
  }

  /**
   * @param {Object} filters
   * @param {boolean} [filters.includeDeleted] - Incluye filas con soft delete (paranoid: false).
   * @param {number|null} page
   * @param {number|null} limit
   * @returns {Promise<Object>}
   */
  async findAll(filters = {}, page = null, limit = null) {
    if (!filters.includeDeleted) {
      return super.findAll(filters, page, limit);
    }

    const Model = this.getModel();
    const where = {
      ...this.buildWhereClause(filters),
    };

    if (!filters.includeInactive) {
      where.activo = true;
    }

    const options = {
      where,
      paranoid: false,
      order: filters.sort
        ? [[filters.sort.split(':')[0], filters.sort.includes(':') ? filters.sort.split(':')[1] : 'ASC']]
        : this._getEffectiveSort(),
    };

    if (filters.attributes && Array.isArray(filters.attributes) && filters.attributes.length > 0) {
      options.attributes = filters.attributes;
    }

    if (page && limit) {
      const offset = (page - 1) * limit;
      options.limit = limit;
      options.offset = offset;

      const { count, rows } = await Model.findAndCountAll(options);
      const collectionName = this.getCollectionName();
      return {
        [collectionName]: rows.map((model) => this.toEntity(model)),
        total: count,
        page,
        limit,
      };
    }

    const rows = await Model.findAll(options);
    const collectionName = this.getCollectionName();
    return {
      [collectionName]: rows.map((model) => this.toEntity(model)),
      total: rows.length,
    };
  }

  /**
   * Asignaciones vigentes del docente en una gestión, con materia y paralelo para carga horaria.
   * @param {number} teacherId
   * @param {number} gestionId — PK de gestiones
   * @returns {Promise<Array<{ id: number, ofertaCursoId: number, asignatura: string, paralelo: string, horas: number }>>}
   */
  async findCargaDetalleByDocenteAndGestion(teacherId, gestionId) {
    const docenteId = Number(teacherId);
    const gestionPk = Number(gestionId);
    if (!Number.isFinite(docenteId) || docenteId < 1 || !Number.isFinite(gestionPk) || gestionPk < 1) {
      return [];
    }

    const rows = await sequelize.query(
      `
      SELECT
        id,
        oferta_curso_id,
        materia_sigla,
        paralelo_nombre,
        horas
      FROM vista_base_asignacion_docente_detalle
      WHERE docente_id = :docenteId
        AND gestion_id = :gestionId
        AND activo = TRUE
        AND vigente = TRUE
      ORDER BY paralelo_nombre ASC, materia_sigla ASC, id ASC
      `,
      {
        replacements: { docenteId, gestionId: gestionPk },
        type: QueryTypes.SELECT,
      }
    );

    return rows.map((row) => ({
      id: Number(row.id),
      ofertaCursoId: Number(row.oferta_curso_id),
      asignatura: row.materia_sigla ?? '',
      paralelo: row.paralelo_nombre ?? '',
      horas: Number(row.horas) || 0,
    }));
  }

  /**
   * Resumen de carga horaria por docente en una gestión (dashboard).
   * @param {number} gestionId — PK de gestiones
   */
  async findCargaResumenByGestion(gestionId) {
    const gId = Number(gestionId);
    if (!Number.isFinite(gId) || gId < 1) return [];

    const rows = await sequelize.query(
      `
      SELECT
        docente_id,
        TRIM(CONCAT(COALESCE(docente_apellido_paterno, ''), ' ', COALESCE(docente_apellido_materno, ''), ' ', COALESCE(docente_nombres, ''))) AS nombre,
        color_hex,
        COALESCE(max_horas_semana, :defaultMaxSemana) AS max_semana,
        COALESCE(SUM(horas), 0) AS carga_semana
      FROM vista_base_asignacion_docente_detalle
      WHERE gestion_id = :gestionId
        AND activo = TRUE
        AND vigente = TRUE
        AND docente_id IS NOT NULL
      GROUP BY docente_id, docente_nombres, docente_apellido_paterno, docente_apellido_materno, color_hex, max_horas_semana
      ORDER BY nombre ASC, docente_id ASC
      `,
      {
        replacements: {
          gestionId: gId,
          defaultMaxSemana: 20,
        },
        type: QueryTypes.SELECT,
      }
    );

    return rows.map((row) => ({
      docenteId: Number(row.docente_id),
      nombre: (row.nombre ?? '').trim(),
      colorHex: row.color_hex ?? null,
      maxSemana: Number(row.max_semana) || 20,
      cargaSemana: Number(row.carga_semana) || 0,
    }));
  }

  /**
   * Marca como no vigentes las asignaciones activas previas sobre la misma oferta.
   * Las matrículas permanecen ancladas a oferta_curso_id (no se repuntan).
   */
  async retireVigenteForOffer(offerCourseId, exceptAssignmentId = null, userId = null) {
    const offerId = Number(offerCourseId);
    if (!Number.isFinite(offerId) || offerId < 1) return 0;

    const result = await this.findAll({ offerCourseId: offerId, active: true }, null, null);
    const list = result.teacherAssignments ?? [];
    let retired = 0;

    for (const assignment of list) {
      const plain = assignment.toPlainObject ? assignment.toPlainObject() : assignment;
      if (exceptAssignmentId != null && Number(plain.id) === Number(exceptAssignmentId)) continue;

      await this.update(
        plain.id,
        {
          active: false,
          reason: 'Reemplazada por nueva asignación docente vigente',
        },
        userId
      );
      retired += 1;
    }

    return retired;
  }

  /**
   * Listado enriquecido con oferta, materia, paralelo y docente.
   */
  async findEnriched(filters = {}, page = 1, limit = 50) {
    const whereParts = [];
    const replacements = {};

    if (filters.managementPlanId) {
      whereParts.push('gestion_plan_id = :managementPlanId');
      replacements.managementPlanId = Number(filters.managementPlanId);
    }
    if (filters.offerCourseId) {
      whereParts.push('oferta_curso_id = :offerCourseId');
      replacements.offerCourseId = Number(filters.offerCourseId);
    }
    if (filters.teacherId) {
      whereParts.push('docente_id = :teacherId');
      replacements.teacherId = Number(filters.teacherId);
    }
    if (filters.parallelManagementId) {
      whereParts.push('paralelo_gestion_id = :parallelManagementId');
      replacements.parallelManagementId = Number(filters.parallelManagementId);
    }
    if (filters.vigente === true) {
      whereParts.push('vigente = TRUE');
    } else if (filters.vigente === false) {
      whereParts.push('vigente = FALSE');
    }
    if (filters.recordActive !== false) {
      whereParts.push('activo = TRUE');
    }

    // La vista ya filtra ad.deleted_at IS NULL; si no hay filtros, traer todo.
    const whereSql = whereParts.length ? whereParts.join(' AND ') : '1 = 1';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 50);
    const offset = (pageNum - 1) * limitNum;

    const baseFrom = `
      FROM vista_base_asignacion_docente_detalle
      WHERE ${whereSql}
    `;

    const [countRows, rows] = await Promise.all([
      sequelize.query(`SELECT COUNT(*) AS total ${baseFrom}`, {
        replacements,
        type: QueryTypes.SELECT,
      }),
      sequelize.query(
        `
        SELECT
          id,
          gestion_plan_id,
          oferta_curso_id,
          paralelo_gestion_id,
          docente_id,
          carga_horaria,
          vigente,
          motivo,
          fecha_asignacion,
          created_at,
          updated_at,
          materia_sigla,
          materia_nombre,
          paralelo_nombre,
          docente_nombres,
          docente_apellido_paterno,
          docente_apellido_materno,
          color_hex
        ${baseFrom}
        ORDER BY id DESC
        LIMIT :limit OFFSET :offset
        `,
        {
          replacements: { ...replacements, limit: limitNum, offset },
          type: QueryTypes.SELECT,
        }
      ),
    ]);

    const total = Number(countRows[0]?.total ?? 0) || 0;
    return { rows, total, page: pageNum, limit: limitNum };
  }

  /**
   * Detalle enriquecido de una asignación docente.
   */
  async findEnrichedById(id) {
    const assignmentId = Number(id);
    if (!Number.isFinite(assignmentId) || assignmentId < 1) return null;

    const result = await sequelize.query(
      `
      SELECT
        id,
        gestion_plan_id,
        oferta_curso_id,
        paralelo_gestion_id,
        docente_id,
        carga_horaria,
        vigente,
        motivo,
        fecha_asignacion,
        created_at,
        updated_at,
        materia_sigla,
        materia_nombre,
        paralelo_nombre,
        docente_nombres,
        docente_apellido_paterno,
        docente_apellido_materno,
        color_hex
      FROM vista_base_asignacion_docente_detalle
      WHERE id = :assignmentId
      LIMIT 1
      `,
      { replacements: { assignmentId }, type: QueryTypes.SELECT }
    );

    return result[0] ?? null;
  }
}

