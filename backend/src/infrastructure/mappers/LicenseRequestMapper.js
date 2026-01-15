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
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de LicenciaSolicitud
   * @returns {LicenseRequest|null} Entidad de dominio LicenseRequest
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de LicenseRequest (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};
    
    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('estudianteId' in dataValues && dataValues.estudianteId !== undefined) {
      specificFields.studentId = dataValues.estudianteId;
    }
    if ('carreraId' in dataValues && dataValues.carreraId !== undefined) {
      specificFields.careerId = dataValues.carreraId;
    }
    if ('gestionId' in dataValues && dataValues.gestionId !== undefined) {
      specificFields.managementId = dataValues.gestionId;
    }
    if ('turnoCursoId' in dataValues && dataValues.turnoCursoId !== undefined) {
      specificFields.courseShiftId = dataValues.turnoCursoId;
    }
    if ('fechaSolicitud' in dataValues && dataValues.fechaSolicitud !== undefined) {
      specificFields.requestDate = dataValues.fechaSolicitud;
    }
    if ('fechaDesde' in dataValues && dataValues.fechaDesde !== undefined) {
      specificFields.startDate = dataValues.fechaDesde;
    }
    if ('fechaHasta' in dataValues && dataValues.fechaHasta !== undefined) {
      specificFields.endDate = dataValues.fechaHasta;
    }
    if ('totalDias' in dataValues && dataValues.totalDias !== undefined) {
      specificFields.totalDays = dataValues.totalDias;
    }
    if ('motivo' in dataValues && dataValues.motivo !== undefined) {
      specificFields.reason = dataValues.motivo;
    }
    if ('detalleMotivo' in dataValues && dataValues.detalleMotivo !== undefined) {
      specificFields.reasonDetail = dataValues.detalleMotivo;
    }
    if ('estado' in dataValues && dataValues.estado !== undefined) {
      specificFields.state = dataValues.estado;
    }
    if ('fechaDecision' in dataValues && dataValues.fechaDecision !== undefined) {
      specificFields.decisionDate = dataValues.fechaDecision;
    }
    if ('decididoPor' in dataValues && dataValues.decididoPor !== undefined) {
      specificFields.decidedBy = dataValues.decididoPor;
    }
    if ('motivoRechazo' in dataValues && dataValues.motivoRechazo !== undefined) {
      specificFields.rejectionReason = dataValues.motivoRechazo;
    }
    if ('documentosCompletos' in dataValues && dataValues.documentosCompletos !== undefined) {
      specificFields.documentsComplete = dataValues.documentosCompletos === 1 || dataValues.documentosCompletos === true;
    }
    if ('fechaInicioEntregaDocumentos' in dataValues && dataValues.fechaInicioEntregaDocumentos !== undefined) {
      specificFields.documentDeliveryStartDate = dataValues.fechaInicioEntregaDocumentos;
    }
    if ('fechaFinEntregaDocumentos' in dataValues && dataValues.fechaFinEntregaDocumentos !== undefined) {
      specificFields.documentDeliveryEndDate = dataValues.fechaFinEntregaDocumentos;
    }
    if ('observaciones' in dataValues && dataValues.observaciones !== undefined) {
      specificFields.observations = dataValues.observaciones;
    }
    if ('observacionesDecision' in dataValues && dataValues.observacionesDecision !== undefined) {
      specificFields.decisionObservations = dataValues.observacionesDecision;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new LicenseRequest(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {LicenseRequest|Object} entity - Entidad LicenseRequest o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad LicenseRequest como objeto plano
    const data = entity instanceof LicenseRequest ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
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
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de LicenseRequest
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {LicenseRequest|Object} entity - Entidad LicenseRequest o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad LicenseRequest como objeto plano
    const data = entity instanceof LicenseRequest ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de LicenseRequest
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('studentId' in data) {
      updateData.estudianteId = data.studentId || null;
    }
    if ('careerId' in data) {
      updateData.carreraId = data.careerId || null;
    }
    if ('managementId' in data) {
      updateData.gestionId = data.managementId || null;
    }
    if ('courseShiftId' in data) {
      updateData.turnoCursoId = data.courseShiftId || null;
    }
    if ('requestDate' in data) {
      updateData.fechaSolicitud = data.requestDate;
    }
    if ('startDate' in data) {
      updateData.fechaDesde = data.startDate;
    }
    if ('endDate' in data) {
      updateData.fechaHasta = data.endDate;
    }
    if ('totalDays' in data) {
      updateData.totalDias = data.totalDays;
    }
    if ('reason' in data) {
      updateData.motivo = data.reason;
    }
    if ('reasonDetail' in data) {
      updateData.detalleMotivo = data.reasonDetail;
    }
    if ('state' in data) {
      updateData.estado = data.state;
    }
    if ('decisionDate' in data) {
      updateData.fechaDecision = data.decisionDate || null;
    }
    if ('decidedBy' in data) {
      updateData.decididoPor = data.decidedBy || null;
    }
    if ('rejectionReason' in data) {
      updateData.motivoRechazo = data.rejectionReason || null;
    }
    if ('documentsComplete' in data) {
      updateData.documentosCompletos = data.documentsComplete;
    }
    if ('documentDeliveryStartDate' in data) {
      updateData.fechaInicioEntregaDocumentos = data.documentDeliveryStartDate || null;
    }
    if ('documentDeliveryEndDate' in data) {
      updateData.fechaFinEntregaDocumentos = data.documentDeliveryEndDate || null;
    }
    if ('observations' in data) {
      updateData.observaciones = data.observations || null;
    }
    if ('decisionObservations' in data) {
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

