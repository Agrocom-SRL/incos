import { IRolRepository } from '../../domain/interfaces/repositories/IRolRepository.js';
import { Rol as RolModel } from '../database/models/rol.js';
import { BaseRepository } from './BaseRepository.js';
import { RoleMapper } from '../mappers/RoleMapper.js';

/**
 * Implementación del repositorio de roles usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a RoleMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa RoleMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IRolRepository
 * - Usa RoleMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IRolRepository}
 * 
 * Esta clase cumple con el contrato IRolRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCodigo() que es requerido por IRolRepository
 */
export class RoleRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de roles
   * @returns {Object} Modelo Rol
   */
  getModel() {
    return RolModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a RoleMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Role|null} Entidad de dominio
   */
  toEntity(model) {
    return RoleMapper.toEntity(model);
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['codigo', 'nombre'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a RoleMapper
   * 
   * @param {Role|Object} data - Entidad Role o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return RoleMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a RoleMapper
   * 
   * @param {Role|Object} data - Entidad Role o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return RoleMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'roles';
  }

  /**
   * Método específico: Buscar rol por código
   * 
   * @param {string} codigo - Código del rol
   * @returns {Promise<Role|null>} Entidad Role o null si no se encuentra
   */
  async findByCodigo(codigo) {
    const model = await this.getModel().findOne({
      where: {
        codigo: codigo,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return this.toEntity(model);
  }
}

