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
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de EstudianteDocumentoEntrega
   * @returns {StudentDocumentDelivery|null} Entidad de dominio StudentDocumentDelivery
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de StudentDocumentDelivery (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};
    
    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('estudianteId' in dataValues && dataValues.estudianteId !== undefined) {
      specificFields.studentId = dataValues.estudianteId;
    }
    if ('documentacionId' in dataValues && dataValues.documentacionId !== undefined) {
      specificFields.documentacionId = dataValues.documentacionId;
    }
    if ('entregado' in dataValues && dataValues.entregado !== undefined) {
      specificFields.entregado = dataValues.entregado === 1 || dataValues.entregado === true;
    }
    if ('enTramite' in dataValues && dataValues.enTramite !== undefined) {
      specificFields.enTramite = dataValues.enTramite === 1 || dataValues.enTramite === true;
    }
    if ('fechaEntrega' in dataValues && dataValues.fechaEntrega !== undefined) {
      specificFields.fechaEntrega = dataValues.fechaEntrega;
    }
    if ('observaciones' in dataValues && dataValues.observaciones !== undefined) {
      specificFields.observations = dataValues.observaciones;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new StudentDocumentDelivery(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {StudentDocumentDelivery|Object} entity - Entidad StudentDocumentDelivery o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad StudentDocumentDelivery como objeto plano
    const data = entity instanceof StudentDocumentDelivery ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      estudianteId: data.studentId || null,
      documentacionId: data.documentacionId || null,
      entregado: data.entregado !== undefined ? data.entregado : false,
      enTramite: data.enTramite !== undefined ? data.enTramite : false,
      fechaEntrega: data.fechaEntrega || null,
      observaciones: data.observaciones || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentDocumentDelivery
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {StudentDocumentDelivery|Object} entity - Entidad StudentDocumentDelivery o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad StudentDocumentDelivery como objeto plano
    const data = entity instanceof StudentDocumentDelivery ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de StudentDocumentDelivery
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('studentId' in data) {
      updateData.estudianteId = data.studentId || null;
    }
    if ('documentacionId' in data) {
      updateData.documentacionId = data.documentacionId || null;
    }
    if ('entregado' in data) {
      updateData.entregado = data.entregado;
    }
    if ('enTramite' in data) {
      updateData.enTramite = data.enTramite;
    }
    if ('fechaEntrega' in data) {
      updateData.fechaEntrega = data.fechaEntrega || null;
    }
    if ('observations' in data || 'observaciones' in data) {
      updateData.observaciones = data.observations ?? data.observaciones ?? null;
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

