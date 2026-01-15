import { Subject } from '../../domain/entities/Subject.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: SubjectMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Subject)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Subject
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Subject
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Subject (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + SubjectMapper (campos específicos)
 * - Infrastructure Layer: SubjectRepository (usa el mapper para conversiones)
 */
export class SubjectMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Subject
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de Materia
   * @returns {Subject|null} Entidad de dominio Subject
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Subject (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};
    
    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('sigla' in dataValues && dataValues.sigla !== undefined) {
      specificFields.acronym = dataValues.sigla;
    }
    if ('nombre' in dataValues && dataValues.nombre !== undefined) {
      specificFields.name = dataValues.nombre;
    }
    if ('objetivos' in dataValues && dataValues.objetivos !== undefined) {
      specificFields.objectives = dataValues.objetivos ?? null;
    }
    if ('clasificacion' in dataValues && dataValues.clasificacion !== undefined) {
      specificFields.classification = dataValues.clasificacion ?? null;
    }
    if ('tipo' in dataValues && dataValues.tipo !== undefined) {
      specificFields.type = dataValues.tipo;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Subject(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {Subject|Object} entity - Entidad Subject o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Subject como objeto plano
    const data = entity instanceof Subject ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      sigla: data.acronym,
      nombre: data.name,
      objetivos: data.objectives ?? null,
      clasificacion: data.classification ?? null,
      tipo: data.type,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Subject
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {Subject|Object} entity - Entidad Subject o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Subject como objeto plano
    const data = entity instanceof Subject ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Subject
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('acronym' in data) {
      updateData.sigla = data.acronym;
    }
    if ('name' in data) {
      updateData.nombre = data.name;
    }
    if ('objectives' in data) {
      updateData.objetivos = data.objectives ?? null;
    }
    if ('classification' in data) {
      updateData.clasificacion = data.classification ?? null;
    }
    if ('type' in data) {
      updateData.tipo = data.type;
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
   * @returns {Subject[]} Array de entidades Subject
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

