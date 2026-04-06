import { IPermisoRepository } from '../../domain/interfaces/repositories/IPermisoRepository.js';
import { Permiso as PermisoModel } from '../database/models/permiso.js';
import { sequelize } from '../database/sequelize.js';
import { BaseRepository } from './BaseRepository.js';
import { PermissionMapper } from '../mappers/PermissionMapper.js';

/**
 * Implementación del repositorio de permisos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a PermissionMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa PermissionMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IPermisoRepository
 * - Usa PermissionMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IPermisoRepository}
 * 
 * Esta clase cumple con el contrato IPermisoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 * 
 * IMPORTANTE: Use findBy / findAll con criterios del dominio (code, domain, module, name).
 */
export class PermissionRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de permisos
   * @returns {Object} Modelo Permiso
   */
  getModel() {
    return PermisoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a PermissionMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Permission|null} Entidad de dominio
   */
  toEntity(model) {
    return PermissionMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Permission
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ module: 'MAT' }) → Por subdominio técnico (modulo)
   * - findAll({ domain: 'ACADEMICO' }) → Por dominio de negocio
   * - findBy({ code: 'academico.calificacion.ver' }) → Por código exacto
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - code: Código del permiso (exacto)
   *   - name: Nombre legible (exacto; texto libre → search())
   *   - domain: Dominio de negocio (exacto)
   *   - module: Subdominio técnico (exacto)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → modelo Sequelize (permiso.js)
    if (filters.code !== undefined) {
      where.codigo = filters.code;
    }
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.domain) {
      where.dominio = filters.domain;
    }
    if (filters.module) {
      where.modulo = filters.module;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['codigo', 'nombre', 'descripcion', 'dominio', 'modulo'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a PermissionMapper
   * 
   * @param {Permission|Object} data - Entidad Permission o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return PermissionMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a PermissionMapper
   * 
   * @param {Permission|Object} data - Entidad Permission o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return PermissionMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'permissions';
  }

  /**
   * Catálogo de permisos activos (raw), opcionalmente filtrado por dominio.
   */
  async findAllActivosPlano({ dominio = null } = {}) {
    const dominioClause = dominio ? 'AND p.dominio = :dominio' : '';
    const replacements = {};
    if (dominio) {
      replacements.dominio = dominio;
    }
    return sequelize.query(
      `
      SELECT p.id, p.codigo, p.nombre, p.dominio, p.modulo
      FROM permisos p
      WHERE p.activo = TRUE AND p.deleted_at IS NULL
        ${dominioClause}
      ORDER BY p.dominio, p.codigo
      `,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );
  }
}

