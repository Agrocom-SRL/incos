import { StudentDisability } from '../../domain/entities/StudentDisability.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: StudentDisabilityMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (StudentDisability)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de StudentDisability
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de StudentDisability
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: StudentDisability (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + StudentDisabilityMapper (campos específicos)
 * - Infrastructure Layer: StudentDisabilityRepository (usa el mapper para conversiones)
 */
export class StudentDisabilityMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentDisability
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de EstudianteDiscapacidad
   * @returns {StudentDisability|null} Entidad de dominio StudentDisability
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de StudentDisability (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};
    
    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('estudianteId' in dataValues && dataValues.estudianteId !== undefined) {
      specificFields.studentId = dataValues.estudianteId;
    }
    if ('tipoDiscapacidadId' in dataValues && dataValues.tipoDiscapacidadId !== undefined) {
      specificFields.disabilityTypeId = dataValues.tipoDiscapacidadId;
    }
    if ('descripcion' in dataValues && dataValues.descripcion !== undefined) {
      specificFields.description = dataValues.descripcion;
    }
    if ('gradoDiscapacidad' in dataValues && dataValues.gradoDiscapacidad !== undefined) {
      specificFields.disabilityDegree = dataValues.gradoDiscapacidad;
    }
    if ('causa' in dataValues && dataValues.causa !== undefined) {
      specificFields.cause = dataValues.causa;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new StudentDisability(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {StudentDisability|Object} entity - Entidad StudentDisability o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad StudentDisability como objeto plano
    const data = entity instanceof StudentDisability ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      estudianteId: data.studentId,
      tipoDiscapacidadId: data.disabilityTypeId,
      descripcion: data.description || null,
      gradoDiscapacidad: data.disabilityDegree || null,
      causa: data.cause || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentDisability
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {StudentDisability|Object} entity - Entidad StudentDisability o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad StudentDisability como objeto plano
    const data = entity instanceof StudentDisability ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de StudentDisability
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('studentId' in data) {
      updateData.estudianteId = data.studentId;
    }
    if ('disabilityTypeId' in data) {
      updateData.tipoDiscapacidadId = data.disabilityTypeId;
    }
    if ('description' in data) {
      updateData.descripcion = data.description || null;
    }
    if ('disabilityDegree' in data) {
      updateData.gradoDiscapacidad = data.disabilityDegree || null;
    }
    if ('cause' in data) {
      updateData.causa = data.cause || null;
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
   * @returns {StudentDisability[]} Array de entidades StudentDisability
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

