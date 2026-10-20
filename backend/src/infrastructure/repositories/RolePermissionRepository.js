import { RolPermiso as RolPermisoModel } from '../database/models/rol_permiso.js';
import { sequelize } from '../database/sequelize.js';
import { BaseRepository } from './BaseRepository.js';
import { RolePermissionMapper } from '../mappers/RolePermissionMapper.js';

/**
 * Implementación del repositorio de roles-permisos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a RolePermissionMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa RolePermissionMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IRolPermisoRepository
 * - Usa RolePermissionMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {IRolPermisoRepository}
 *
 * Esta clase cumple con el contrato IRolPermisoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 *
 * IMPORTANTE: Se eliminaron findByRolId() y findByPermisoId() porque son redundantes.
 * Usar en su lugar:
 * - findAll({ roleId: X }) → Reemplaza findByRolId()
 * - findAll({ permissionId: X }) → Reemplaza findByPermisoId()
 */
export class RolePermissionRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de roles-permisos
   * @returns {Object} Modelo RolPermiso
   */
  getModel() {
    return RolPermisoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a RolePermissionMapper
   *
   * @param {Object} model - Modelo Sequelize
   * @returns {RolePermission|null} Entidad de dominio
   */
  toEntity(model) {
    return RolePermissionMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad RolePermission
   *
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   *
   * Ejemplos de uso:
   * - findAll({ roleId: 1 }) → Busca permisos de un rol
   * - findAll({ permissionId: 2 }) → Busca roles con un permiso
   * - findBy({ roleId: 1, permissionId: 2, action: 'CREAR' }) → Busca permiso específico
   *
   * @param {Object} filters - Filtros de búsqueda
   *   - roleId: ID del rol
   *   - permissionId: ID del permiso
   *   - action: Acción (VER, CREAR, EDITAR, ELIMINAR, APROBAR, EXPORTAR)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.roleId) {
      where.rolId = filters.roleId;
    }
    if (filters.permissionId) {
      where.permisoId = filters.permissionId;
    }
    if (filters.action) {
      where.accion = filters.action;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['accion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a RolePermissionMapper
   *
   * @param {RolePermission|Object} data - Entidad RolePermission o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, _userId = null) {
    return RolePermissionMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a RolePermissionMapper
   *
   * @param {RolePermission|Object} data - Entidad RolePermission o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, _userId = null) {
    return RolePermissionMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'rolePermissions';
  }

  /**
   * Filas planas rol-permiso + metadatos del permiso (para agrupar por dominio).
   */
  async findFlatByRolId(rolId) {
    return sequelize.query(
      `
      SELECT
        id, accion,
        permiso_id, codigo, nombre, dominio, modulo, grupo_ui, ruta_sidebar
      FROM vista_roles_permisos_detalle_activos
      WHERE rol_id = :rolId
      ORDER BY dominio, codigo, accion
      `,
      { replacements: { rolId }, type: sequelize.QueryTypes.SELECT }
    );
  }

  /**
   * Permisos agrupados por grupo_ui para la grilla del panel de seguridad.
   * Combina acciones validas del catalogo vs acciones asignadas al rol.
   */
  async findPermisosParaGrilla(rolId, dominio) {
    const esAdminSistema = Number(rolId) === 1;
    const rows = await sequelize.query(
      `
      SELECT
        grupo_ui,
        nombre,
        ruta_sidebar,
        codigos,
        acciones_validas,
        acciones_asignadas
      FROM vista_grilla_roles_permisos_agrupada
      WHERE rol_id = :rolId
        AND dominio = :dominio
      ORDER BY grupo_ui
      `,
      {
        replacements: { rolId, dominio },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return rows.map((r) => {
      const accionesValidas = r.acciones_validas ? r.acciones_validas.split(',') : [];
      const accionesAsignadasRaw = r.acciones_asignadas
        ? r.acciones_asignadas.split(',').filter(Boolean)
        : [];
      return {
        grupoUi: r.grupo_ui,
        grupoNombre: r.nombre || null,
        rutaSidebar: r.ruta_sidebar || null,
        codigos: r.codigos ? r.codigos.split(',') : [],
        accionesValidas,
        // ADMIN_SISTEMA: sin filas en roles_permisos; la grilla refleja todo el catálogo (56)
        accionesAsignadas: esAdminSistema ? accionesValidas : accionesAsignadasRaw,
      };
    });
  }

  /**
   * Soft delete de todas las asignaciones activas del rol e inserción de nuevas filas.
   * @param {number} rolId
   * @param {{ permiso_id: number, accion: string }[]} asignaciones
   */
  async replaceAllAssignmentsForRol(rolId, asignaciones) {
    return sequelize.transaction(async (t) => {
      await sequelize.query(
        `
        UPDATE roles_permisos
        SET activo = FALSE,
            deleted_at = NOW(),
            updated_at = NOW()
        WHERE rol_id = :rolId
          AND activo = TRUE
          AND deleted_at IS NULL
        `,
        { replacements: { rolId }, transaction: t }
      );

      for (const row of asignaciones) {
        await sequelize.query(
          `
          INSERT INTO roles_permisos
            (rol_id, permiso_id, accion, activo, created_at, updated_at)
          VALUES
            (:rolId, :permisoId, :accion, TRUE, NOW(), NOW())
          `,
          {
            replacements: {
              rolId,
              permisoId: row.permiso_id,
              accion: row.accion,
            },
            transaction: t,
          }
        );
      }
    });
  }
}
