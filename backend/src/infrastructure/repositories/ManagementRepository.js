import { IGestionRepository } from '../../domain/interfaces/repositories/IGestionRepository.js';
import { Gestion as GestionModel } from '../database/models/gestion.js';
import { Management } from '../../domain/entities/Management.js';
import { BaseRepository } from './BaseRepository.js';
import { Op } from 'sequelize';

/**
 * Implementación del repositorio de gestiones académicas usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IGestionRepository}
 * 
 * Esta clase cumple con el contrato IGestionRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCodigo(), findByAnio() y findActive() que son requeridos por IGestionRepository
 */
export class ManagementRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de gestiones
   * @returns {Object} Modelo Gestion
   */
  getModel() {
    return GestionModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {Management|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new Management({
      id: model.id,
      code: model.codigo,
      year: model.anio,
      promotionImageUrl: model.imagenPromocionUrl,
      administrativeStartDate: model.fechaInicioAdministrativa,
      administrativeEndDate: model.fechaFinAdministrativa,
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

    if (filters.year) {
      where.anio = filters.year;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['codigo'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['anio', 'DESC'], ['codigo', 'DESC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      codigo: data.code,
      anio: data.year,
      imagenPromocionUrl: data.promotionImageUrl || null,
      fechaInicioAdministrativa: data.administrativeStartDate,
      fechaFinAdministrativa: data.administrativeEndDate,
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

    if (data.code !== undefined) {
      updateData.codigo = data.code;
    }
    if (data.year !== undefined) {
      updateData.anio = data.year;
    }
    if (data.promotionImageUrl !== undefined) {
      updateData.imagenPromocionUrl = data.promotionImageUrl || null;
    }
    if (data.administrativeStartDate !== undefined) {
      updateData.fechaInicioAdministrativa = data.administrativeStartDate;
    }
    if (data.administrativeEndDate !== undefined) {
      updateData.fechaFinAdministrativa = data.administrativeEndDate;
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
    return 'managements';
  }

  /**
   * Método específico: Buscar gestión por código
   * @param {string} codigo
   * @returns {Promise<Management|null>}
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
   * Método específico: Buscar gestiones por año
   * @param {number} anio
   * @returns {Promise<Management[]>}
   */
  async findByAnio(anio) {
    const models = await this.getModel().findAll({
      where: {
        anio: anio,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['codigo', 'DESC']],
    });
    return models.map((model) => this.toEntity(model));
  }

  /**
   * Método específico: Buscar gestión activa actual
   * @returns {Promise<Management|null>}
   */
  async findActive() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const model = await this.getModel().findOne({
      where: {
        activo: true,
        fechaInicioAdministrativa: { [Op.lte]: today },
        fechaFinAdministrativa: { [Op.gte]: today },
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['codigo', 'DESC']],
    });
    return this.toEntity(model);
  }
}

