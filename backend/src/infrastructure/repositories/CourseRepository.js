import { ICursoRepository } from '../../domain/interfaces/repositories/ICursoRepository.js';
import { Curso as CursoModel } from '../database/models/curso.js';
import { BaseRepository } from './BaseRepository.js';
import { CourseMapper } from '../mappers/CourseMapper.js';

/**
 * Implementación del repositorio de cursos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a CourseMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa CourseMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de ICursoRepository
 * - Usa CourseMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
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
   * Delega la responsabilidad de mapeo a CourseMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Course|null} Entidad de dominio
   */
  toEntity(model) {
    return CourseMapper.toEntity(model);
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
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a CourseMapper
   * 
   * @param {Course|Object} data - Entidad Course o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return CourseMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a CourseMapper
   * 
   * @param {Course|Object} data - Entidad Course o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return CourseMapper.toModelForUpdate(data);
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
   * 
   * @param {number} materiaId - ID de la materia
   * @returns {Promise<Course[]>} Array de entidades Course
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
    return CourseMapper.toEntityList(models);
  }
}

