import { ICarreraRepository } from '../../domain/interfaces/repositories/ICarreraRepository.js';
import { Carrera as CarreraModel } from '../database/models/carrera.js';
import { BaseRepository } from './BaseRepository.js';
import { CareerMapper } from '../mappers/CareerMapper.js';

/**
 * Implementación del repositorio de carreras usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a CareerMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa CareerMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de ICarreraRepository
 * - Usa CareerMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {ICarreraRepository}
 * 
 * Esta clase cumple con el contrato ICarreraRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCodigo() que es requerido por ICarreraRepository
 */
export class CareerRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de carreras
   * @returns {Object} Modelo Carrera
   */
  getModel() {
    return CarreraModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a CareerMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Career|null} Entidad de dominio
   */
  toEntity(model) {
    return CareerMapper.toEntity(model);
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['codigo', 'nombre', 'descripcion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a CareerMapper
   * 
   * @param {Career|Object} data - Entidad Career o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return CareerMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a CareerMapper
   * 
   * @param {Career|Object} data - Entidad Career o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return CareerMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'careers';
  }

  /**
   * Método específico: Buscar carrera por código
   * 
   * @param {string} codigo - Código de la carrera
   * @returns {Promise<Career|null>} Entidad Career o null si no se encuentra
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

