import { IDepartamentoRepository } from '../../domain/interfaces/repositories/IDepartamentoRepository.js';
import { Departamento as DepartamentoModel } from '../database/models/departamento.js';
import { BaseRepository } from './BaseRepository.js';
import { DepartmentMapper } from '../mappers/DepartmentMapper.js';
import { Op } from 'sequelize';

/**
 * Implementación del repositorio de departamentos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a DepartmentMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa DepartmentMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IDepartamentoRepository
 * - Usa DepartmentMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IDepartamentoRepository}
 * 
 * Esta clase cumple con el contrato IDepartamentoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByPaisId() y findByCodigo() que son requeridos por IDepartamentoRepository
 */
export class DepartmentRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de departamentos
   * @returns {Object} Modelo Departamento
   */
  getModel() {
    return DepartamentoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a DepartmentMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Department|null} Entidad de dominio
   */
  toEntity(model) {
    return DepartmentMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.countryId) {
      where.paisId = filters.countryId;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombre', 'codigo'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a DepartmentMapper
   * 
   * @param {Department|Object} data - Entidad Department o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return DepartmentMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a DepartmentMapper
   * 
   * @param {Department|Object} data - Entidad Department o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return DepartmentMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'departments';
  }

  /**
   * Método específico: Buscar departamentos por país
   * 
   * @param {number} paisId - ID del país
   * @returns {Promise<Department[]>} Array de entidades Department
   */
  async findByPaisId(paisId) {
    const models = await this.getModel().findAll({
      where: {
        paisId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['nombre', 'ASC']],
    });
    return DepartmentMapper.toEntityList(models);
  }

  /**
   * Método específico: Buscar departamento por código
   * 
   * @param {string} codigo - Código del departamento
   * @returns {Promise<Department|null>} Entidad Department o null si no se encuentra
   */
  async findByCodigo(codigo) {
    const model = await this.getModel().findOne({
      where: {
        codigo: codigo.toUpperCase(),
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return this.toEntity(model);
  }

  /**
   * Sobrescribe el método search para incluir búsqueda case-insensitive en código
   * Respeta el filtro de registros eliminados (paranoid: true) y el estado activo
   * @param {string} searchTerm
   * @param {Object} options - Opciones opcionales (includeInactive)
   * @returns {Promise<Department[]>}
   */
  async search(searchTerm, options = {}) {
    const Model = this.getModel();

    const where = {
      // paranoid: true automáticamente excluye deletedAt !== null (registros eliminados lógicamente)
      [Op.or]: [
        { nombre: { [Op.like]: `%${searchTerm}%` } },
        { codigo: { [Op.like]: `%${searchTerm.toUpperCase()}%` } },
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

    return DepartmentMapper.toEntityList(models);
  }
}
