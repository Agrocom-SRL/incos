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
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   *
   * Flujo: Base de Datos → ORM Model → Domain Entity
   *
   * @param {Object|null} model - Modelo Sequelize de BecaDescuento
   * @returns {Scholarship|null} Entidad de dominio Scholarship
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Scholarship (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};

    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('nombre' in dataValues && dataValues.nombre !== undefined) {
      specificFields.name = dataValues.nombre;
    }
    if ('codigo' in dataValues && dataValues.codigo !== undefined) {
      specificFields.code = dataValues.codigo ?? null;
    }
    if ('porcentaje' in dataValues && dataValues.porcentaje !== undefined) {
      specificFields.percentage = dataValues.porcentaje !== null ? parseFloat(dataValues.porcentaje) : null;
    }
    if ('descripcion' in dataValues && dataValues.descripcion !== undefined) {
      specificFields.description = dataValues.descripcion ?? null;
    }
    if ('requiereDocumentacion' in dataValues && dataValues.requiereDocumentacion !== undefined) {
      specificFields.requiresDocumentation = Boolean(dataValues.requiereDocumentacion);
    }
    if ('requiereAprobacionRector' in dataValues && dataValues.requiereAprobacionRector !== undefined) {
      specificFields.requiresRectorApproval = Boolean(dataValues.requiereAprobacionRector);
    }
    if ('esAutomatica' in dataValues && dataValues.esAutomatica !== undefined) {
      specificFields.isAutomatic = Boolean(dataValues.esAutomatica);
    }
    if ('tipoAutomatica' in dataValues && dataValues.tipoAutomatica !== undefined) {
      specificFields.automaticType = dataValues.tipoAutomatica;
    }
    if ('promedioMinimo' in dataValues && dataValues.promedioMinimo !== undefined) {
      specificFields.minimumAverage = dataValues.promedioMinimo !== null ? parseFloat(dataValues.promedioMinimo) : null;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);

    return new Scholarship(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   *
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   *
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   *
   * @param {Scholarship|Object} entity - Entidad Scholarship o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Scholarship como objeto plano
    const data = entity instanceof Scholarship ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
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
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Scholarship
   *
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   *
   * @param {Scholarship|Object} entity - Entidad Scholarship o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Scholarship como objeto plano
    const data = entity instanceof Scholarship ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Scholarship
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('name' in data) {
      updateData.nombre = data.name;
    }
    if ('code' in data) {
      updateData.codigo = data.code || null;
    }
    if ('percentage' in data) {
      updateData.porcentaje = data.percentage;
    }
    if ('description' in data) {
      updateData.descripcion = data.description || null;
    }
    if ('requiresDocumentation' in data) {
      updateData.requiereDocumentacion = data.requiresDocumentation;
    }
    if ('requiresRectorApproval' in data) {
      updateData.requiereAprobacionRector = data.requiresRectorApproval;
    }
    if ('isAutomatic' in data) {
      updateData.esAutomatica = data.isAutomatic;
    }
    if ('automaticType' in data) {
      updateData.tipoAutomatica = data.automaticType;
    }
    if ('minimumAverage' in data) {
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
