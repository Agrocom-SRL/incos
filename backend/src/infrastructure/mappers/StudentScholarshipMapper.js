import { StudentScholarship } from '../../domain/entities/StudentScholarship.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: StudentScholarshipMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (StudentScholarship)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de StudentScholarship
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de StudentScholarship
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: StudentScholarship (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + StudentScholarshipMapper (campos específicos)
 * - Infrastructure Layer: StudentScholarshipRepository (usa el mapper para conversiones)
 */
export class StudentScholarshipMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentScholarship
   * 
   * @param {Object|null} model - Modelo Sequelize de EstudianteBeca
   * @returns {StudentScholarship|null} Entidad de dominio StudentScholarship
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de StudentScholarship (campos del dominio)
    const specificFields = {
      studentId: model.estudianteId,
      scholarshipId: model.becaDescuentoId,
      managementId: model.gestionId,
      requestDate: model.fechaSolicitud,
      state: model.estado,
      documentsComplete: model.documentosCompletos === 1 || model.documentosCompletos === true,
      documentDeliveryStartDate: model.fechaInicioEntregaDocumentos,
      documentDeliveryEndDate: model.fechaFinEntregaDocumentos,
      observations: model.observaciones,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new StudentScholarship(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {StudentScholarship|Object} entity - Entidad StudentScholarship o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad StudentScholarship como objeto plano
    const data = entity instanceof StudentScholarship ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      estudianteId: data.studentId || null,
      becaDescuentoId: data.scholarshipId || null,
      gestionId: data.managementId || null,
      fechaSolicitud: data.requestDate,
      estado: data.state || 'PENDIENTE',
      documentosCompletos: data.documentsComplete !== undefined ? data.documentsComplete : false,
      fechaInicioEntregaDocumentos: data.documentDeliveryStartDate || null,
      fechaFinEntregaDocumentos: data.documentDeliveryEndDate || null,
      observaciones: data.observations || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentScholarship
   * 
   * @param {StudentScholarship|Object} entity - Entidad StudentScholarship o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad StudentScholarship como objeto plano
    const data = entity instanceof StudentScholarship ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de StudentScholarship
    if (data.studentId !== undefined) {
      updateData.estudianteId = data.studentId || null;
    }
    if (data.scholarshipId !== undefined) {
      updateData.becaDescuentoId = data.scholarshipId || null;
    }
    if (data.managementId !== undefined) {
      updateData.gestionId = data.managementId || null;
    }
    if (data.requestDate !== undefined) {
      updateData.fechaSolicitud = data.requestDate;
    }
    if (data.state !== undefined) {
      updateData.estado = data.state;
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

    // Campos base (active/activo)
    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  /**
   * Convierte un array de modelos Sequelize a array de entidades de dominio
   * 
   * @param {Array} models - Array de modelos Sequelize
   * @returns {StudentScholarship[]} Array de entidades StudentScholarship
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

