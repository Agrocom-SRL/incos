import { Personal as PersonalModel } from '../database/models/personal.js';
import { BaseRepository } from './BaseRepository.js';
import { StaffMapper } from '../mappers/StaffMapper.js';

/**
 * Implementación del repositorio de personal usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a StaffMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa StaffMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IPersonalRepository
 * - Usa StaffMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {IPersonalRepository}
 *
 * Esta clase cumple con el contrato IPersonalRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 *
 * IMPORTANTE: Se eliminó findByCI() porque es redundante.
 * Usar en su lugar:
 * - findBy({ ci: '1234567', expedition: 'LP' }) → Reemplaza findByCI()
 */
export class StaffRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de personal
   * @returns {Object} Modelo Personal
   */
  getModel() {
    return PersonalModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a StaffMapper
   *
   * @param {Object} model - Modelo Sequelize
   * @returns {Staff|null} Entidad de dominio
   */
  toEntity(model) {
    return StaffMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.userId) {
      where.usuarioId = filters.userId;
    }
    if (filters.municipalityId) {
      where.municipioId = filters.municipalityId;
    }
    if (filters.gender) {
      where.genero = filters.gender;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombres', 'apellidoPaterno', 'apellidoMaterno', 'ci', 'emailPersonal'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a StaffMapper
   *
   * @param {Staff|Object} data - Entidad Staff o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, _userId = null) {
    return StaffMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a StaffMapper
   *
   * @param {Staff|Object} data - Entidad Staff o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, _userId = null) {
    return StaffMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'staff';
  }
}
