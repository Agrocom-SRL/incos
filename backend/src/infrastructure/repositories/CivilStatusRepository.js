import { IEstadoCivilRepository } from '../../domain/interfaces/repositories/IEstadoCivilRepository.js';
import { EstadoCivil as EstadoCivilModel } from '../database/models/estado_civil.js';
import { BaseRepository } from './BaseRepository.js';
import { CivilStatusMapper } from '../mappers/CivilStatusMapper.js';
import { Op } from 'sequelize';

/**
 * Implementación del repositorio de estados civiles usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a CivilStatusMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa CivilStatusMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IEstadoCivilRepository
 * - Usa CivilStatusMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IEstadoCivilRepository}
 * 
 * Esta clase cumple con el contrato IEstadoCivilRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 */
export class CivilStatusRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de estados civiles
   * @returns {Object} Modelo EstadoCivil
   */
  getModel() {
    return EstadoCivilModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a CivilStatusMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {CivilStatus|null} Entidad de dominio
   */
  toEntity(model) {
    return CivilStatusMapper.toEntity(model);
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombre', 'abreviatura'];
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
   * Delega la responsabilidad de mapeo a CivilStatusMapper
   * 
   * @param {CivilStatus|Object} data - Entidad CivilStatus o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return CivilStatusMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a CivilStatusMapper
   * 
   * @param {CivilStatus|Object} data - Entidad CivilStatus o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return CivilStatusMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'civilStatuses';
  }

  /**
   * Sobrescribe el método search para incluir búsqueda case-insensitive en abreviatura
   * Respeta el filtro de registros eliminados (paranoid: true) y el estado activo
   * @param {string} searchTerm
   * @param {Object} options - Opciones opcionales (includeInactive)
   * @returns {Promise<CivilStatus[]>}
   */
  async search(searchTerm, options = {}) {
    const Model = this.getModel();

    const where = {
      // paranoid: true automáticamente excluye deletedAt !== null (registros eliminados lógicamente)
      [Op.or]: [
        { nombre: { [Op.like]: `%${searchTerm}%` } },
        { abreviatura: { [Op.like]: `%${searchTerm.toUpperCase()}%` } },
      ],
    };

    // Filtrar por estado activo/inactivo (solo si no se solicita incluir inactivos)
    if (!options.includeInactive) {
      where.activo = true; // Solo registros activos por defecto
    }

    const models = await Model.findAll({
      where,
      order: this.getDefaultSort(),
      limit: 50,
    });

    return CivilStatusMapper.toEntityList(models);
  }
}

