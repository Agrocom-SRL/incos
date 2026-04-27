import { QueryTypes } from 'sequelize';
import { IManagementPlanRepository } from '../../domain/interfaces/repositories/IManagementPlanRepository.js';
import { GestionPlan as GestionPlanModel } from '../database/models/gestion_plan.js';
import { sequelize } from '../database/sequelize.js';
import { BaseRepository } from './BaseRepository.js';
import { ManagementPlanMapper } from '../mappers/ManagementPlanMapper.js';

/**
 * Implementación del repositorio de planes habilitados por gestión usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ManagementPlanMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ManagementPlanMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IManagementPlanRepository
 * - Usa ManagementPlanMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IManagementPlanRepository}
 * 
 * Esta clase cumple con el contrato IManagementPlanRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 */
export class ManagementPlanRepository extends BaseRepository {
  getModel() {
    return GestionPlanModel;
  }

  toEntity(model) {
    return ManagementPlanMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad ManagementPlan
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ managementId: 1 }) → Busca planes habilitados de una gestión
   * - findAll({ studyPlanId: 2, state: 'VIGENTE' }) → Busca planes vigentes de un plan de estudios
   * - findBy({ managementId: 1, studyPlanId: 2 }) → Busca plan habilitado específico
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - managementId: ID de la gestión
   *   - studyPlanId: ID del plan de estudios
   *   - name: Nombre del plan habilitado (búsqueda exacta, para búsqueda de texto usar search())
   *   - state: Estado del plan (PROPUESTO, VIGENTE, CANCELADO, etc.)
   *   - cancellationReason: Motivo de cancelación (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.managementId) {
      where.gestionId = filters.managementId;
    }
    if (filters.studyPlanId) {
      where.planEstudioId = filters.studyPlanId;
    }
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.state) {
      where.estado = filters.state;
    }
    if (filters.cancellationReason !== undefined) {
      where.motivoCancelacion = filters.cancellationReason;
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
    return ['nombre'];
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
    return ManagementPlanMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return ManagementPlanMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'managementPlans';
  }

  /**
   * Planes habilitados con datos de gestión (catálogo para asignación docente).
   * @param {{ gestionId?: number|null, page?: number, limit?: number }} opts
   * @returns {Promise<{ rows: Array<Object>, total: number }>}
   */
  async findPlanesDocenteAsignacionCatalog(opts = {}) {
    const page = Math.max(1, parseInt(String(opts.page ?? 1), 10) || 1);
    const limit = Math.min(10000, Math.max(1, parseInt(String(opts.limit ?? 200), 10) || 200));
    const offset = (page - 1) * limit;
    const gestionId = opts.gestionId != null && Number.isFinite(Number(opts.gestionId)) ? Number(opts.gestionId) : 0;

    const whereGestion = gestionId > 0 ? 'AND gp.gestion_id = :gestionId' : '';

    const countSql = `
      SELECT COUNT(*) AS total
      FROM gestiones_planes gp
      INNER JOIN gestiones g ON g.id = gp.gestion_id AND g.deleted_at IS NULL
      WHERE gp.deleted_at IS NULL
        AND gp.activo = 1
        ${whereGestion}
    `;

    const listSql = `
      SELECT
        gp.id AS id,
        gp.gestion_id AS gestionId,
        g.codigo AS gestionCodigo,
        g.nombre AS gestionNombre,
        g.anio AS gestionAnio,
        gp.plan_estudio_id AS planEstudioId,
        gp.nombre AS nombre,
        gp.estado AS estado
      FROM gestiones_planes gp
      INNER JOIN gestiones g ON g.id = gp.gestion_id AND g.deleted_at IS NULL
      WHERE gp.deleted_at IS NULL
        AND gp.activo = 1
        ${whereGestion}
      ORDER BY g.anio DESC, gp.id DESC
      LIMIT :limit OFFSET :offset
    `;

    const countReplacements = gestionId > 0 ? { gestionId } : {};
    const listReplacements = gestionId > 0 ? { gestionId, limit, offset } : { limit, offset };

    const countRows = await sequelize.query(countSql, { replacements: countReplacements, type: QueryTypes.SELECT });
    const total = Number(countRows[0]?.total ?? countRows[0]?.TOTAL ?? 0) || 0;
    const rows = await sequelize.query(listSql, { replacements: listReplacements, type: QueryTypes.SELECT });
    return { rows, total };
  }
}
