import { LicenseRequest } from '../../domain/entities/LicenseRequest.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: LicenseRequestMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (LicenseRequest)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de LicenseRequest
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de LicenseRequest
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: LicenseRequest (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + LicenseRequestMapper (campos específicos)
 * - Infrastructure Layer: LicenseRequestRepository (usa el mapper para conversiones)
 */
export class LicenseRequestMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de LicenseRequest
   * 
   * @param {Object|null} model - Modelo Sequelize de LicenciaSolicitud
   * @returns {LicenseRequest|null} Entidad de dominio LicenseRequest
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de LicenseRequest (campos del dominio)
    const specificFields = {
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
      documentsComplete: model.documentosCompletos === 1 || model.documentosCompletos === true,
      documentDeliveryStartDate: model.fechaInicioEntregaDocumentos,
      documentDeliveryEndDate: model.fechaFinEntregaDocumentos,
      observations: model.observaciones,
      decisionObservations: model.observacionesDecision,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new LicenseRequest(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {LicenseRequest|Object} entity - Entidad LicenseRequest o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad LicenseRequest como objeto plano
    const data = entity instanceof LicenseRequest ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
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
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de LicenseRequest
   * 
   * @param {LicenseRequest|Object} entity - Entidad LicenseRequest o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad LicenseRequest como objeto plano
    const data = entity instanceof LicenseRequest ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de LicenseRequest
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

    // Campos base (active/activo)
    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  /**
   * Convierte un array de modelos Sequelize a array de entidades de dominio
   * 
   * @param {Array} models - Array de modelos Sequelize
   * @returns {LicenseRequest[]} Array de entidades LicenseRequest
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

