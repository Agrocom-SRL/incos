import { ILicenciaSolicitudRepository } from '../../domain/interfaces/repositories/ILicenciaSolicitudRepository.js';
import { LicenciaSolicitud as LicenciaSolicitudModel } from '../database/models/LicenciaSolicitud.js';
import { LicenseRequest } from '../../domain/entities/LicenseRequest.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de solicitudes de licencias usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
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
   * @param {Object} model
   * @returns {LicenseRequest|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new LicenseRequest({
      id: model.id,
      studentId: model.estudianteId,
      careerId: model.carreraId,
      managementId: model.gestionId,
      courseShiftId: model.turnoCursoId,
      requestDate: model.fechaSolicitud,
      startDate: model.fechaDesde,
      endDate: model.fechaHasta,
      totalDays: model.totalDias,
      reason: model.motivo,
      reasonDetail: model.detalleMotivo,
      state: model.estado,
      decisionDate: model.fechaDecision,
      decidedBy: model.decididoPor,
      rejectionReason: model.motivoRechazo,
      documentsComplete: model.documentosCompletos,
      documentDeliveryStartDate: model.fechaInicioEntregaDocumentos,
      documentDeliveryEndDate: model.fechaFinEntregaDocumentos,
      observations: model.observaciones,
      decisionObservations: model.observacionesDecision,
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
  getDefaultSort() {
    return [['fechaSolicitud', 'DESC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      estudianteId: data.studentId || null,
      carreraId: data.careerId || null,
      gestionId: data.managementId || null,
      turnoCursoId: data.courseShiftId || null,
      fechaSolicitud: data.requestDate,
      fechaDesde: data.startDate,
      fechaHasta: data.endDate,
      totalDias: data.totalDays,
      motivo: data.reason,
      detalleMotivo: data.reasonDetail,
      estado: data.state || 'PENDIENTE',
      fechaDecision: data.decisionDate || null,
      decididoPor: data.decidedBy || null,
      motivoRechazo: data.rejectionReason || null,
      documentosCompletos: data.documentsComplete !== undefined ? data.documentsComplete : false,
      fechaInicioEntregaDocumentos: data.documentDeliveryStartDate || null,
      fechaFinEntregaDocumentos: data.documentDeliveryEndDate || null,
      observaciones: data.observations || null,
      observacionesDecision: data.decisionObservations || null,
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

    if (data.studentId !== undefined) {
      updateData.estudianteId = data.studentId || null;
    }
    if (data.careerId !== undefined) {
      updateData.carreraId = data.careerId || null;
    }
    if (data.managementId !== undefined) {
      updateData.gestionId = data.managementId || null;
    }
    if (data.courseShiftId !== undefined) {
      updateData.turnoCursoId = data.courseShiftId || null;
    }
    if (data.requestDate !== undefined) {
      updateData.fechaSolicitud = data.requestDate;
    }
    if (data.startDate !== undefined) {
      updateData.fechaDesde = data.startDate;
    }
    if (data.endDate !== undefined) {
      updateData.fechaHasta = data.endDate;
    }
    if (data.totalDays !== undefined) {
      updateData.totalDias = data.totalDays;
    }
    if (data.reason !== undefined) {
      updateData.motivo = data.reason;
    }
    if (data.reasonDetail !== undefined) {
      updateData.detalleMotivo = data.reasonDetail;
    }
    if (data.state !== undefined) {
      updateData.estado = data.state;
    }
    if (data.decisionDate !== undefined) {
      updateData.fechaDecision = data.decisionDate || null;
    }
    if (data.decidedBy !== undefined) {
      updateData.decididoPor = data.decidedBy || null;
    }
    if (data.rejectionReason !== undefined) {
      updateData.motivoRechazo = data.rejectionReason || null;
    }
    if (data.documentsComplete !== undefined) {
      updateData.documentosCompletos = data.documentsComplete;
    }
    if (data.documentDeliveryStartDate !== undefined) {
      updateData.fechaInicioEntregaDocumentos = data.documentDeliveryStartDate || null;
    }
    if (data.documentDeliveryEndDate !== undefined) {
      updateData.fechaFinEntregaDocumentos = data.documentDeliveryEndDate || null;
    }
    if (data.observations !== undefined) {
      updateData.observaciones = data.observations || null;
    }
    if (data.decisionObservations !== undefined) {
      updateData.observacionesDecision = data.decisionObservations || null;
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
    return 'licenseRequests';
  }

  /**
   * Método específico: Buscar licencias por estudiante
   * @param {number} estudianteId
   * @returns {Promise<LicenseRequest[]>}
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
    return models.map((model) => this.toEntity(model));
  }

  /**
   * Método específico: Buscar licencias por gestión
   * @param {number} gestionId
   * @returns {Promise<LicenseRequest[]>}
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
    return models.map((model) => this.toEntity(model));
  }
}

