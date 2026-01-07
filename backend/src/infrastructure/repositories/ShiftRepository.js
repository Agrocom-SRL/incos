import { ITurnoRepository } from '../../domain/interfaces/repositories/ITurnoRepository.js';
import { Turno as TurnoModel } from '../database/models/turno.js';
import { BaseRepository } from './BaseRepository.js';
import { ShiftMapper } from '../mappers/ShiftMapper.js';

/**
 * Implementación del repositorio de turnos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ShiftMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ShiftMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de ITurnoRepository
 * - Usa ShiftMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {ITurnoRepository}
 * 
 * Esta clase cumple con el contrato ITurnoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - No tiene métodos específicos adicionales
 */
export class ShiftRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de turnos
   * @returns {Object} Modelo Turno
   */
  getModel() {
    return TurnoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a ShiftMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Shift|null} Entidad de dominio
   */
  toEntity(model) {
    return ShiftMapper.toEntity(model);
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
   * Delega la responsabilidad de mapeo a ShiftMapper
   * 
   * @param {Shift|Object} data - Entidad Shift o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return ShiftMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a ShiftMapper
   * 
   * @param {Shift|Object} data - Entidad Shift o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return ShiftMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'shifts';
  }
}

