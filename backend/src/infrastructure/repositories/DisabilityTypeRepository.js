import { ITipoDiscapacidadRepository } from '../../domain/interfaces/repositories/ITipoDiscapacidadRepository.js';
import { TipoDiscapacidad as TipoDiscapacidadModel } from '../database/models/tipo_discapacidad.js';
import { BaseRepository } from './BaseRepository.js';
import { DisabilityTypeMapper } from '../mappers/DisabilityTypeMapper.js';

/**
 * Implementación del repositorio de tipos de discapacidad usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a DisabilityTypeMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa DisabilityTypeMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de ITipoDiscapacidadRepository
 * - Usa DisabilityTypeMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {ITipoDiscapacidadRepository}
 * 
 * Esta clase cumple con el contrato ITipoDiscapacidadRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 */
export class DisabilityTypeRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de tipos de discapacidad
   * @returns {Object} Modelo TipoDiscapacidad
   */
  getModel() {
    return TipoDiscapacidadModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a DisabilityTypeMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {DisabilityType|null} Entidad de dominio
   */
  toEntity(model) {
    return DisabilityTypeMapper.toEntity(model);
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
  getDefaultSort() {
    return [['nombre', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a DisabilityTypeMapper
   * 
   * @param {DisabilityType|Object} data - Entidad DisabilityType o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return DisabilityTypeMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a DisabilityTypeMapper
   * 
   * @param {DisabilityType|Object} data - Entidad DisabilityType o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return DisabilityTypeMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'disabilityTypes';
  }
}

