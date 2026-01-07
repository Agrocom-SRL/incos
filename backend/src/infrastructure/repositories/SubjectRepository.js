import { IMateriaRepository } from '../../domain/interfaces/repositories/IMateriaRepository.js';
import { Materia as MateriaModel } from '../database/models/materia.js';
import { BaseRepository } from './BaseRepository.js';
import { SubjectMapper } from '../mappers/SubjectMapper.js';

/**
 * Implementación del repositorio de materias usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a SubjectMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa SubjectMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IMateriaRepository
 * - Usa SubjectMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IMateriaRepository}
 * 
 * Esta clase cumple con el contrato IMateriaRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCodigo() que es requerido por IMateriaRepository
 */
export class SubjectRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de materias
   * @returns {Object} Modelo Materia
   */
  getModel() {
    return MateriaModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a SubjectMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Subject|null} Entidad de dominio
   */
  toEntity(model) {
    return SubjectMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.type) {
      where.tipo = filters.type;
    }
    if (filters.knowledgeArea) {
      where.areaConocimiento = filters.knowledgeArea;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['codigo', 'nombre', 'nombreCorto', 'descripcion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a SubjectMapper
   * 
   * @param {Subject|Object} data - Entidad Subject o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return SubjectMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a SubjectMapper
   * 
   * @param {Subject|Object} data - Entidad Subject o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return SubjectMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'subjects';
  }

  /**
   * Método específico: Buscar materia por código
   * 
   * @param {string} codigo - Código de la materia
   * @returns {Promise<Subject|null>} Entidad Subject o null si no se encuentra
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

