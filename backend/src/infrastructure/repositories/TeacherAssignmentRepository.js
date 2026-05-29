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
      where.cursoId = filters.courseId;
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
        ad.id,
        ad.oferta_curso_id,
        m.sigla AS asignatura_sigla,
        p.nombre AS paralelo_nombre,
        COALESCE(ad.carga_horaria, ap.horas_semanales, 0) AS horas
      FROM asignaciones_docentes ad
      INNER JOIN gestiones_planes gp
        ON gp.id = ad.gestion_plan_id
        AND gp.deleted_at IS NULL
        AND gp.activo = TRUE
      INNER JOIN oferta_cursos oc
        ON oc.id = ad.oferta_curso_id
        AND oc.deleted_at IS NULL
        AND oc.activo = TRUE
      INNER JOIN asignaturas_plan ap
        ON ap.id = oc.asignatura_plan_id
        AND ap.deleted_at IS NULL
        AND ap.activo = TRUE
      INNER JOIN materias m
        ON m.id = ap.materia_id
        AND m.deleted_at IS NULL
        AND m.activo = TRUE
      INNER JOIN paralelos_gestion pg
        ON pg.id = oc.paralelo_gestion_id
        AND pg.deleted_at IS NULL
        AND pg.activo = TRUE
      INNER JOIN paralelos p
        ON p.id = pg.paralelo_id
        AND p.deleted_at IS NULL
        AND p.activo = TRUE
      WHERE ad.docente_id = :docenteId
        AND gp.gestion_id = :gestionId
        AND ad.deleted_at IS NULL
        AND ad.activo = TRUE
        AND ad.vigente = TRUE
      ORDER BY p.nombre ASC, m.sigla ASC, ad.id ASC
      `,
      {
        replacements: { docenteId, gestionId: gestionPk },
        type: QueryTypes.SELECT,
      }
    );

    return rows.map((row) => ({
      id: Number(row.id),
      ofertaCursoId: Number(row.oferta_curso_id),
      asignatura: row.asignatura_sigla ?? '',
      paralelo: row.paralelo_nombre ?? '',
      horas: Number(row.horas) || 0,
    }));
  }
}

