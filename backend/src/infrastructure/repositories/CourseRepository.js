import { ICursoRepository } from '../../domain/interfaces/repositories/ICursoRepository.js';
import { Curso as CursoModel } from '../database/models/curso.js';
import { Course } from '../../domain/entities/Course.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de cursos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {ICursoRepository}
 * 
 * Esta clase cumple con el contrato ICursoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByMateriaId() que es requerido por ICursoRepository
 */
export class CourseRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de cursos
   * @returns {Object} Modelo Curso
   */
  getModel() {
    return CursoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {Course|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new Course({
      id: model.id,
      subjectId: model.materiaId,
      name: model.nombre,
      code: model.codigo,
      maxCapacity: model.cupoMaximo,
      minCapacity: model.cupoMinimo,
      state: model.estado,
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
    if (filters.state) {
      where.estado = filters.state;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombre', 'codigo', 'descripcion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['nombre', 'ASC']];
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
      nombre: data.name,
      codigo: data.code || null,
      cupoMaximo: data.maxCapacity !== undefined ? data.maxCapacity : 35,
      cupoMinimo: data.minCapacity !== undefined ? data.minCapacity : 10,
      estado: data.state || 'PROPUESTO',
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
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.code !== undefined) {
      updateData.codigo = data.code || null;
    }
    if (data.maxCapacity !== undefined) {
      updateData.cupoMaximo = data.maxCapacity;
    }
    if (data.minCapacity !== undefined) {
      updateData.cupoMinimo = data.minCapacity;
    }
    if (data.state !== undefined) {
      updateData.estado = data.state;
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
    return 'courses';
  }

  /**
   * Método específico: Buscar cursos por materia
   * @param {number} materiaId
   * @returns {Promise<Course[]>}
   */
  async findByMateriaId(materiaId) {
    const models = await this.getModel().findAll({
      where: {
        materiaId: materiaId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['nombre', 'ASC']],
    });
    return models.map((model) => this.toEntity(model));
  }
}

