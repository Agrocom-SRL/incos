import { IPrerrequisitoRepository } from '../../domain/interfaces/repositories/IPrerrequisitoRepository.js';
import { Prerrequisito as PrerrequisitoModel } from '../database/models/prerrequisito.js';
import { BaseRepository } from './BaseRepository.js';
import { PrerequisiteMapper } from '../mappers/PrerequisiteMapper.js';

/**
 * Implementación del repositorio de prerrequisitos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a PrerequisiteMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa PrerequisiteMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IPrerrequisitoRepository
 * - Usa PrerequisiteMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IPrerrequisitoRepository}
 * 
 * Esta clase cumple con el contrato IPrerrequisitoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByMateriaId() que es requerido por IPrerrequisitoRepository
 */
export class PrerequisiteRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de prerrequisitos
   * @returns {Object} Modelo Prerrequisito
   */
  getModel() {
    return PrerrequisitoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a PrerequisiteMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Prerequisite|null} Entidad de dominio
   */
  toEntity(model) {
    return PrerequisiteMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.subjectId) {
      where.materiaId = filters.subjectId;
    }
    if (filters.prerequisiteSubjectId) {
      where.materiaPrerrequisitoId = filters.prerequisiteSubjectId;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['descripcion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a PrerequisiteMapper
   * 
   * @param {Prerequisite|Object} data - Entidad Prerequisite o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return PrerequisiteMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a PrerequisiteMapper
   * 
   * @param {Prerequisite|Object} data - Entidad Prerequisite o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return PrerequisiteMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'prerequisites';
  }

  /**
   * Método específico: Buscar prerrequisitos por materia
   * 
   * @param {number} materiaId - ID de la materia
   * @returns {Promise<Prerequisite[]>} Array de entidades Prerequisite
   */
  async findByMateriaId(materiaId) {
    const models = await this.getModel().findAll({
      where: {
        materiaId: materiaId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['materiaPrerrequisitoId', 'ASC']],
    });
    return PrerequisiteMapper.toEntityList(models);
  }
}

