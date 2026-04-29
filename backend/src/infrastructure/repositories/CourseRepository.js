import { QueryTypes } from 'sequelize';
import { ICursoRepository } from '../../domain/interfaces/repositories/ICursoRepository.js';
import { Curso as CursoModel } from '../database/models/curso.js';
import { sequelize } from '../database/sequelize.js';
import { BaseRepository } from './BaseRepository.js';
import { CourseMapper } from '../mappers/CourseMapper.js';

/**
 * Implementación del repositorio de cursos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a CourseMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa CourseMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de ICursoRepository
 * - Usa CourseMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {ICursoRepository}
 * 
 * Esta clase cumple con el contrato ICursoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 */
export class CourseRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de cursos
   * @returns {Object} Modelo Curso
   */
  getModel() {
    return CursoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a CourseMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Course|null} Entidad de dominio
   */
  toEntity(model) {
    return CourseMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Course
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ parallelId: 1 }) → Busca cursos de un paralelo
   * - findBy({ code: 'MAT-101-A' }) → Busca por código
   * - findAll({ maxCapacity: 35 }) → Busca cursos con capacidad específica
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - code: Código del curso (búsqueda exacta, para búsqueda de texto usar search())
   *   - parallelId: ID del paralelo
   *   - planSubjectId: ID de la asignatura del plan
   *   - maxCapacity: Capacidad máxima
   *   - minCapacity: Capacidad mínima
   *   - colorHex: Color hexadecimal
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.code !== undefined) {
      where.codigo = filters.code;
    }
    if (filters.parallelId) {
      where.paraleloId = filters.parallelId;
    }
    if (filters.planSubjectId) {
      where.asignaturaPlanId = filters.planSubjectId;
    }
    if (filters.maxCapacity !== undefined) {
      where.cupoMaximo = filters.maxCapacity;
    }
    if (filters.minCapacity !== undefined) {
      where.cupoMinimo = filters.minCapacity;
    }
    if (filters.colorHex !== undefined) {
      where.colorHex = filters.colorHex;
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
    return ['codigo'];
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
   * Delega la responsabilidad de mapeo a CourseMapper
   * 
   * @param {Course|Object} data - Entidad Course o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return CourseMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a CourseMapper
   * 
   * @param {Course|Object} data - Entidad Course o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return CourseMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'courses';
  }

  /**
   * Cursos del maestro de oferta cuya asignatura pertenece al plan de estudios indicado.
   * @param {number} studyPlanId
   * @param {{ page?: number, limit?: number }} opts
   * @returns {Promise<{ rows: Array<Object>, total: number }>}
   */
  async findCursosByStudyPlanIdForCatalog(studyPlanId, opts = {}) {
    const planId = Number(studyPlanId);
    if (!Number.isFinite(planId) || planId < 1) {
      return { rows: [], total: 0 };
    }
    const page = Math.max(1, parseInt(String(opts.page ?? 1), 10) || 1);
    const limit = Math.min(10000, Math.max(1, parseInt(String(opts.limit ?? 500), 10) || 500));
    const offset = (page - 1) * limit;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM vista_catalogo_cursos_oferta_docente v
      WHERE v.planEstudioId = :planId
    `;

    const listSql = `
      SELECT
        v.id AS id,
        v.codigo AS codigo,
        v.paraleloId AS paraleloId,
        v.asignaturaPlanId AS asignaturaPlanId
      FROM vista_catalogo_cursos_oferta_docente v
      WHERE v.planEstudioId = :planId
      ORDER BY v.codigo ASC
      LIMIT :limit OFFSET :offset
    `;

    const countRows = await sequelize.query(countSql, { replacements: { planId }, type: QueryTypes.SELECT });
    const total = Number(countRows[0]?.total ?? countRows[0]?.TOTAL ?? 0) || 0;
    const rows = await sequelize.query(listSql, { replacements: { planId, limit, offset }, type: QueryTypes.SELECT });
    return { rows, total };
  }

  /**
   * Cursos ofertados en un paralelo (maestro de oferta) con materia para UI de asignación docente.
   * @param {number} paraleloId
   * @param {{ page?: number, limit?: number }} opts
   * @returns {Promise<{ rows: Array<Object>, total: number }>}
   */
  async findCursosByParaleloIdForCatalog(paraleloId, opts = {}) {
    const pid = Number(paraleloId);
    if (!Number.isFinite(pid) || pid < 1) {
      return { rows: [], total: 0 };
    }
    const page = Math.max(1, parseInt(String(opts.page ?? 1), 10) || 1);
    const limit = Math.min(10000, Math.max(1, parseInt(String(opts.limit ?? 500), 10) || 500));
    const offset = (page - 1) * limit;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM vista_catalogo_cursos_oferta_docente v
      WHERE v.paraleloId = :paraleloId
    `;

    const listSql = `
      SELECT
        v.id AS id,
        v.codigo AS codigo,
        v.paraleloId AS paraleloId,
        v.asignaturaPlanId AS asignaturaPlanId,
        v.materiaNombre AS materiaNombre,
        v.materiaSigla AS materiaSigla,
        v.periodoId AS periodoId
      FROM vista_catalogo_cursos_oferta_docente v
      WHERE v.paraleloId = :paraleloId
      ORDER BY v.ordenVisualizacion ASC, v.codigo ASC
      LIMIT :limit OFFSET :offset
    `;

    const countRows = await sequelize.query(countSql, { replacements: { paraleloId: pid }, type: QueryTypes.SELECT });
    const total = Number(countRows[0]?.total ?? countRows[0]?.TOTAL ?? 0) || 0;
    const rows = await sequelize.query(listSql, { replacements: { paraleloId: pid, limit, offset }, type: QueryTypes.SELECT });
    return { rows, total };
  }
}

