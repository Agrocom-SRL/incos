import { ILicenciaSolicitudRepository } from '../../domain/interfaces/repositories/ILicenciaSolicitudRepository.js';
import { LicenciaSolicitud as LicenciaSolicitudModel } from '../database/models/licencia_solicitud.js';
import { BaseRepository } from './BaseRepository.js';
import { LicenseRequestMapper } from '../mappers/LicenseRequestMapper.js';

/**
 * Implementación del repositorio de solicitudes de licencias usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a LicenseRequestMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa LicenseRequestMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de ILicenciaSolicitudRepository
 * - Usa LicenseRequestMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {ILicenciaSolicitudRepository}
 * 
 * Esta clase cumple con el contrato ILicenciaSolicitudRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByEstudianteId() y findByGestionId() que son requeridos por ILicenciaSolicitudRepository
 */
export class LicenseRequestRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de solicitudes de licencias
   * @returns {Object} Modelo LicenciaSolicitud
   */
  getModel() {
    return LicenciaSolicitudModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a LicenseRequestMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {LicenseRequest|null} Entidad de dominio
   */
  toEntity(model) {
    return LicenseRequestMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.studentId) {
      where.estudianteId = filters.studentId;
    }
    if (filters.managementId) {
      where.gestionId = filters.managementId;
    }
    if (filters.careerId) {
      where.carreraId = filters.careerId;
    }
    if (filters.state) {
      where.estado = filters.state;
    }
    if (filters.reason) {
      where.motivo = filters.reason;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['detalleMotivo', 'observaciones', 'observacionesDecision'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a LicenseRequestMapper
   * 
   * @param {LicenseRequest|Object} data - Entidad LicenseRequest o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return LicenseRequestMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a LicenseRequestMapper
   * 
   * @param {LicenseRequest|Object} data - Entidad LicenseRequest o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return LicenseRequestMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'licenseRequests';
  }

  /**
   * Método específico: Buscar licencias por estudiante
   * 
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise<LicenseRequest[]>} Array de entidades LicenseRequest
   */
  async findByEstudianteId(estudianteId) {
    const models = await this.getModel().findAll({
      where: {
        estudianteId: estudianteId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['fechaSolicitud', 'DESC']],
    });
    return LicenseRequestMapper.toEntityList(models);
  }

  /**
   * Método específico: Buscar licencias por gestión
   * 
   * @param {number} gestionId - ID de la gestión
   * @returns {Promise<LicenseRequest[]>} Array de entidades LicenseRequest
   */
  async findByGestionId(gestionId) {
    const models = await this.getModel().findAll({
      where: {
        gestionId: gestionId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['fechaSolicitud', 'DESC']],
    });
    return LicenseRequestMapper.toEntityList(models);
  }
}
