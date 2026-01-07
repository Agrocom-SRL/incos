import { IBecaDescuentoRepository } from '../../domain/interfaces/repositories/IBecaDescuentoRepository.js';
import { BecaDescuento as BecaDescuentoModel } from '../database/models/beca_descuento.js';
import { BaseRepository } from './BaseRepository.js';
import { ScholarshipMapper } from '../mappers/ScholarshipMapper.js';

/**
 * Implementación del repositorio de becas y descuentos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ScholarshipMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ScholarshipMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IBecaDescuentoRepository
 * - Usa ScholarshipMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IBecaDescuentoRepository}
 * 
 * Esta clase cumple con el contrato IBecaDescuentoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCodigo(), findByPorcentaje() y findAutomaticas() que son requeridos por IBecaDescuentoRepository
 */
export class ScholarshipRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de becas y descuentos
   * @returns {Object} Modelo BecaDescuento
   */
  getModel() {
    return BecaDescuentoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a ScholarshipMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Scholarship|null} Entidad de dominio
   */
  toEntity(model) {
    return ScholarshipMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.isAutomatic !== undefined) {
      where.esAutomatica = filters.isAutomatic;
    }
    if (filters.requiresRectorApproval !== undefined) {
      where.requiereAprobacionRector = filters.requiresRectorApproval;
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
   * Delega la responsabilidad de mapeo a ScholarshipMapper
   * 
   * @param {Scholarship|Object} data - Entidad Scholarship o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return ScholarshipMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a ScholarshipMapper
   * 
   * @param {Scholarship|Object} data - Entidad Scholarship o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return ScholarshipMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'scholarships';
  }

  /**
   * Método específico: Buscar beca por código
   * 
   * @param {string} codigo - Código de la beca
   * @returns {Promise<Scholarship|null>} Entidad Scholarship o null si no se encuentra
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

  /**
   * Método específico: Buscar beca por porcentaje
   * 
   * @param {number} porcentaje - Porcentaje de la beca
   * @returns {Promise<Scholarship|null>} Entidad Scholarship o null si no se encuentra
   */
  async findByPorcentaje(porcentaje) {
    const model = await this.getModel().findOne({
      where: {
        porcentaje: porcentaje,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return this.toEntity(model);
  }

  /**
   * Método específico: Buscar becas automáticas
   * 
   * @returns {Promise<Scholarship[]>} Array de entidades Scholarship
   */
  async findAutomaticas() {
    const models = await this.getModel().findAll({
      where: {
        esAutomatica: true,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['porcentaje', 'ASC']],
    });
    return ScholarshipMapper.toEntityList(models);
  }
}

