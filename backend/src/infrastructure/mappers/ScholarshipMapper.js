import { Scholarship } from '../../domain/entities/Scholarship.js';
import { BaseMapper } from './BaseMapper.js';
import { TIPOS_BECA_AUTOMATICA } from '../../domain/constants/becas.constants.js';

/**
 * Mapper: ScholarshipMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Scholarship)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Scholarship
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Scholarship
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Scholarship (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + ScholarshipMapper (campos específicos)
 * - Infrastructure Layer: ScholarshipRepository (usa el mapper para conversiones)
 */
export class ScholarshipMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Scholarship
   * 
   * @param {Object|null} model - Modelo Sequelize de BecaDescuento
   * @returns {Scholarship|null} Entidad de dominio Scholarship
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Scholarship (campos del dominio)
    const specificFields = {
      name: model.nombre,
      code: model.codigo ?? null,
      percentage: model.porcentaje !== null && model.porcentaje !== undefined ? parseFloat(model.porcentaje) : null,
      description: model.descripcion ?? null,
      requiresDocumentation: Boolean(model.requiereDocumentacion),
      requiresRectorApproval: Boolean(model.requiereAprobacionRector),
      isAutomatic: Boolean(model.esAutomatica),
      automaticType: model.tipoAutomatica,
      minimumAverage: model.promedioMinimo !== null && model.promedioMinimo !== undefined ? parseFloat(model.promedioMinimo) : null,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Scholarship(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Scholarship|Object} entity - Entidad Scholarship o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Scholarship como objeto plano
    const data = entity instanceof Scholarship ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      nombre: data.name,
      codigo: data.code || null,
      porcentaje: data.percentage,
      descripcion: data.description || null,
      requiereDocumentacion: data.requiresDocumentation !== undefined ? data.requiresDocumentation : true,
      requiereAprobacionRector: data.requiresRectorApproval !== undefined ? data.requiresRectorApproval : false,
      esAutomatica: data.isAutomatic !== undefined ? data.isAutomatic : false,
      tipoAutomatica: data.automaticType || TIPOS_BECA_AUTOMATICA.MANUAL,
      promedioMinimo: data.minimumAverage || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Scholarship
   * 
   * @param {Scholarship|Object} entity - Entidad Scholarship o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Scholarship como objeto plano
    const data = entity instanceof Scholarship ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Scholarship
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.code !== undefined) {
      updateData.codigo = data.code || null;
    }
    if (data.percentage !== undefined) {
      updateData.porcentaje = data.percentage;
    }
    if (data.description !== undefined) {
      updateData.descripcion = data.description || null;
    }
    if (data.requiresDocumentation !== undefined) {
      updateData.requiereDocumentacion = data.requiresDocumentation;
    }
    if (data.requiresRectorApproval !== undefined) {
      updateData.requiereAprobacionRector = data.requiresRectorApproval;
    }
    if (data.isAutomatic !== undefined) {
      updateData.esAutomatica = data.isAutomatic;
    }
    if (data.automaticType !== undefined) {
      updateData.tipoAutomatica = data.automaticType;
    }
    if (data.minimumAverage !== undefined) {
      updateData.promedioMinimo = data.minimumAverage || null;
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
   * @returns {Scholarship[]} Array de entidades Scholarship
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

