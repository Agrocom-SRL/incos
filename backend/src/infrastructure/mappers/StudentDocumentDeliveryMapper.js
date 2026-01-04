import { StudentDocumentDelivery } from '../../domain/entities/StudentDocumentDelivery.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: StudentDocumentDeliveryMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (StudentDocumentDelivery)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de StudentDocumentDelivery
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de StudentDocumentDelivery
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: StudentDocumentDelivery (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + StudentDocumentDeliveryMapper (campos específicos)
 * - Infrastructure Layer: StudentDocumentDeliveryRepository (usa el mapper para conversiones)
 */
export class StudentDocumentDeliveryMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentDocumentDelivery
   * 
   * @param {Object|null} model - Modelo Sequelize de EstudianteDocumentoEntrega
   * @returns {StudentDocumentDelivery|null} Entidad de dominio StudentDocumentDelivery
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de StudentDocumentDelivery (campos del dominio)
    const specificFields = {
      studentId: model.estudianteId,
      documentacionId: model.documentacionId,
      entregado: model.entregado === 1 || model.entregado === true,
      enTramite: model.enTramite === 1 || model.enTramite === true,
      esOriginal: model.esOriginal === 1 || model.esOriginal === true,
      fechaEntrega: model.fechaEntrega,
      fechaVencimientoTramite: model.fechaVencimientoTramite,
      observaciones: model.observaciones,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new StudentDocumentDelivery(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {StudentDocumentDelivery|Object} entity - Entidad StudentDocumentDelivery o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad StudentDocumentDelivery como objeto plano
    const data = entity instanceof StudentDocumentDelivery ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      estudianteId: data.studentId || null,
      documentacionId: data.documentacionId || null,
      entregado: data.entregado !== undefined ? data.entregado : false,
      enTramite: data.enTramite !== undefined ? data.enTramite : false,
      esOriginal: data.esOriginal !== undefined ? data.esOriginal : false,
      fechaEntrega: data.fechaEntrega || null,
      fechaVencimientoTramite: data.fechaVencimientoTramite || null,
      observaciones: data.observaciones || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentDocumentDelivery
   * 
   * @param {StudentDocumentDelivery|Object} entity - Entidad StudentDocumentDelivery o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad StudentDocumentDelivery como objeto plano
    const data = entity instanceof StudentDocumentDelivery ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de StudentDocumentDelivery
    if (data.studentId !== undefined) {
      updateData.estudianteId = data.studentId || null;
    }
    if (data.documentacionId !== undefined) {
      updateData.documentacionId = data.documentacionId || null;
    }
    if (data.entregado !== undefined) {
      updateData.entregado = data.entregado;
    }
    if (data.enTramite !== undefined) {
      updateData.enTramite = data.enTramite;
    }
    if (data.esOriginal !== undefined) {
      updateData.esOriginal = data.esOriginal;
    }
    if (data.fechaEntrega !== undefined) {
      updateData.fechaEntrega = data.fechaEntrega || null;
    }
    if (data.fechaVencimientoTramite !== undefined) {
      updateData.fechaVencimientoTramite = data.fechaVencimientoTramite || null;
    }
    if (data.observaciones !== undefined) {
      updateData.observaciones = data.observaciones || null;
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
   * @returns {StudentDocumentDelivery[]} Array de entidades StudentDocumentDelivery
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

