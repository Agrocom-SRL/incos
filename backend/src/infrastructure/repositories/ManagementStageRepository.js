import { IEtapaGestionRepository } from '../../domain/interfaces/repositories/IEtapaGestionRepository.js';
import { EtapaGestion as EtapaGestionModel } from '../database/models/EtapaGestion.js';
import { ManagementStage } from '../../domain/entities/ManagementStage.js';
import { BaseRepository } from './BaseRepository.js';
import { Op } from 'sequelize';

/**
 * Implementación del repositorio de etapas de gestión usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IEtapaGestionRepository}
 * 
 * Esta clase cumple con el contrato IEtapaGestionRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByGestionId() y findVigentes() que son requeridos por IEtapaGestionRepository
 */
export class ManagementStageRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de etapas de gestión
   * @returns {Object} Modelo EtapaGestion
   */
  getModel() {
    return EtapaGestionModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {ManagementStage|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new ManagementStage({
      id: model.id,
      managementId: model.gestionId,
      name: model.nombre,
      type: model.tipo,
      startDate: model.fechaInicio,
      endDate: model.fechaFin,
      isActive: model.vigente,
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

    if (filters.managementId) {
      where.gestionId = filters.managementId;
    }
    if (filters.type) {
      where.tipo = filters.type;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombre', 'descripcion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['fechaInicio', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      gestionId: data.managementId || null,
      nombre: data.name,
      tipo: data.type,
      fechaInicio: data.startDate,
      fechaFin: data.endDate || null,
      vigente: data.isActive !== undefined ? data.isActive : false,
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

    if (data.managementId !== undefined) {
      updateData.gestionId = data.managementId || null;
    }
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.type !== undefined) {
      updateData.tipo = data.type;
    }
    if (data.startDate !== undefined) {
      updateData.fechaInicio = data.startDate;
    }
    if (data.endDate !== undefined) {
      updateData.fechaFin = data.endDate || null;
    }
    if (data.isActive !== undefined) {
      updateData.vigente = data.isActive;
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
    return 'managementStages';
  }

  /**
   * Método específico: Buscar etapas por gestión
   * @param {number} gestionId
   * @returns {Promise<ManagementStage[]>}
   */
  async findByGestionId(gestionId) {
    const models = await this.getModel().findAll({
      where: {
        gestionId: gestionId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['fechaInicio', 'ASC']],
    });
    return models.map((model) => this.toEntity(model));
  }

  /**
   * Método específico: Buscar etapas vigentes
   * @returns {Promise<ManagementStage[]>}
   */
  async findVigentes() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const models = await this.getModel().findAll({
      where: {
        activo: true,
        vigente: true,
        fechaInicio: { [Op.lte]: today },
        [Op.or]: [
          { fechaFin: null },
          { fechaFin: { [Op.gte]: today } },
        ],
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['fechaInicio', 'ASC']],
    });
    return models.map((model) => this.toEntity(model));
  }
}

