import { IPrerrequisitoRepository } from '../../domain/interfaces/repositories/IPrerrequisitoRepository.js';
import { Prerrequisito as PrerrequisitoModel } from '../database/models/Prerrequisito.js';
import { Prerequisite } from '../../domain/entities/Prerequisite.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de prerrequisitos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
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
   * @param {Object} model
   * @returns {Prerequisite|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new Prerequisite({
      id: model.id,
      subjectId: model.materiaId,
      prerequisiteSubjectId: model.materiaPrerrequisitoId,
      description: model.descripcion,
      activo: model.activo,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
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
  getDefaultSort() {
    return [['materiaId', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      materiaId: data.subjectId || null,
      materiaPrerrequisitoId: data.prerequisiteSubjectId || null,
      descripcion: data.description || null,
    };
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToUpdate(data, userId = null) {
    const updateData = {};

    if (data.subjectId !== undefined) {
      updateData.materiaId = data.subjectId || null;
    }
    if (data.prerequisiteSubjectId !== undefined) {
      updateData.materiaPrerrequisitoId = data.prerequisiteSubjectId || null;
    }
    if (data.description !== undefined) {
      updateData.descripcion = data.description || null;
    }
    if (data.activo !== undefined) {
      updateData.activo = data.activo;
    }

    return updateData;
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
   * @param {number} materiaId
   * @returns {Promise<Prerequisite[]>}
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
    return models.map((model) => this.toEntity(model));
  }
}

