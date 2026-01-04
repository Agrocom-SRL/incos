import { IEtapaGestionRepository } from '../../domain/interfaces/repositories/IEtapaGestionRepository.js';
import { EtapaGestion as EtapaGestionModel } from '../database/models/etapa_gestion.js';
import { BaseRepository } from './BaseRepository.js';
import { ManagementStageMapper } from '../mappers/ManagementStageMapper.js';
import { Op } from 'sequelize';

/**
 * Implementación del repositorio de etapas de gestión usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ManagementStageMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ManagementStageMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IEtapaGestionRepository
 * - Usa ManagementStageMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
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
   * Delega la responsabilidad de mapeo a ManagementStageMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {ManagementStage|null} Entidad de dominio
   */
  toEntity(model) {
    return ManagementStageMapper.toEntity(model);
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
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a ManagementStageMapper
   * 
   * @param {ManagementStage|Object} data - Entidad ManagementStage o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return ManagementStageMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a ManagementStageMapper
   * 
   * @param {ManagementStage|Object} data - Entidad ManagementStage o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return ManagementStageMapper.toModelForUpdate(data);
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
   * 
   * @param {number} gestionId - ID de la gestión
   * @returns {Promise<ManagementStage[]>} Array de entidades ManagementStage
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
    return ManagementStageMapper.toEntityList(models);
  }

  /**
   * Método específico: Buscar etapas vigentes
   * 
   * @returns {Promise<ManagementStage[]>} Array de entidades ManagementStage
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
    return ManagementStageMapper.toEntityList(models);
  }
}

