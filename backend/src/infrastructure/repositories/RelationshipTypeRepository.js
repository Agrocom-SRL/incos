import { ITipoParentescoRepository } from '../../domain/interfaces/repositories/ITipoParentescoRepository.js';
import { TipoParentesco as TipoParentescoModel } from '../database/models/tipo_parentesco.js';
import { BaseRepository } from './BaseRepository.js';
import { RelationshipTypeMapper } from '../mappers/RelationshipTypeMapper.js';

/**
 * Implementación del repositorio de tipos de parentesco usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a RelationshipTypeMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa RelationshipTypeMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de ITipoParentescoRepository
 * - Usa RelationshipTypeMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {ITipoParentescoRepository}
 * 
 * Esta clase cumple con el contrato ITipoParentescoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 */
export class RelationshipTypeRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de tipos de parentesco
   * @returns {Object} Modelo TipoParentesco
   */
  getModel() {
    return TipoParentescoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a RelationshipTypeMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {RelationshipType|null} Entidad de dominio
   */
  toEntity(model) {
    return RelationshipTypeMapper.toEntity(model);
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombre', 'descripcion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a RelationshipTypeMapper
   * 
   * @param {RelationshipType|Object} data - Entidad RelationshipType o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return RelationshipTypeMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a RelationshipTypeMapper
   * 
   * @param {RelationshipType|Object} data - Entidad RelationshipType o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return RelationshipTypeMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'relationshipTypes';
  }
}

