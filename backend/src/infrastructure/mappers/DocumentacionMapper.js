import { Documentacion } from '../../domain/entities/Documentacion.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: DocumentacionMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Documentacion)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Documentacion
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Documentacion
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Documentacion (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + DocumentacionMapper (campos específicos)
 * - Infrastructure Layer: DocumentacionRepository (usa el mapper para conversiones)
 */
export class DocumentacionMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Documentacion
   * 
   * @param {Object|null} model - Modelo Sequelize de Documentacion
   * @returns {Documentacion|null} Entidad de dominio Documentacion
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Documentacion (campos del dominio)
    const specificFields = {
      name: model.nombre,
      documentType: model.tipoDocumento,
      acceptsPhotocopy: model.aceptaFotocopia === 1 || model.aceptaFotocopia === true,
      required: model.requerido === 1 || model.requerido === true,
      order: model.orden,
      description: model.descripcion,
      documentoPadreId: model.documentoPadreId ?? null,
      esOriginal: model.esOriginal === 1 || model.esOriginal === true,
      esDocumentoSistema: model.esDocumentoSistema === 1 || model.esDocumentoSistema === true,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Documentacion(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Documentacion|Object} entity - Entidad Documentacion o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Documentacion como objeto plano
    const data = entity instanceof Documentacion ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      nombre: data.name,
      tipoDocumento: data.documentType,
      aceptaFotocopia: data.acceptsPhotocopy !== undefined ? data.acceptsPhotocopy : false,
      requerido: data.required !== undefined ? data.required : true,
      orden: data.order || 0,
      descripcion: data.description || null,
      documentoPadreId: data.documentoPadreId ?? null,
      esOriginal: data.esOriginal !== undefined ? data.esOriginal : false,
      esDocumentoSistema: data.esDocumentoSistema !== undefined ? data.esDocumentoSistema : false,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Documentacion
   * 
   * @param {Documentacion|Object} entity - Entidad Documentacion o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Documentacion como objeto plano
    const data = entity instanceof Documentacion ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Documentacion
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.documentType !== undefined) {
      updateData.tipoDocumento = data.documentType;
    }
    if (data.acceptsPhotocopy !== undefined) {
      updateData.aceptaFotocopia = data.acceptsPhotocopy;
    }
    if (data.required !== undefined) {
      updateData.requerido = data.required;
    }
    if (data.order !== undefined) {
      updateData.orden = data.order;
    }
    if (data.description !== undefined) {
      updateData.descripcion = data.description || null;
    }
    if (data.documentoPadreId !== undefined) {
      updateData.documentoPadreId = data.documentoPadreId ?? null;
    }
    if (data.esOriginal !== undefined) {
      updateData.esOriginal = data.esOriginal;
    }
    if (data.esDocumentoSistema !== undefined) {
      updateData.esDocumentoSistema = data.esDocumentoSistema;
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
   * @returns {Documentacion[]} Array de entidades Documentacion
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

