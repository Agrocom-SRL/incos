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
   * 
   * @param {Object|null} model - Modelo Sequelize de EstudianteDiscapacidad
   * @returns {StudentDisability|null} Entidad de dominio StudentDisability
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de StudentDisability (campos del dominio)
    const specificFields = {
      studentId: model.estudianteId,
      disabilityTypeId: model.tipoDiscapacidadId,
      description: model.descripcion,
      disabilityDegree: model.gradoDiscapacidad,
      cause: model.causa,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new StudentDisability(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {StudentDisability|Object} entity - Entidad StudentDisability o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad StudentDisability como objeto plano
    const data = entity instanceof StudentDisability ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
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
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentDisability
   * 
   * @param {StudentDisability|Object} entity - Entidad StudentDisability o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad StudentDisability como objeto plano
    const data = entity instanceof StudentDisability ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de StudentDisability
    if (data.studentId !== undefined) {
      updateData.estudianteId = data.studentId;
    }
    if (data.disabilityTypeId !== undefined) {
      updateData.tipoDiscapacidadId = data.disabilityTypeId;
    }
    if (data.description !== undefined) {
      updateData.descripcion = data.description || null;
    }
    if (data.disabilityDegree !== undefined) {
      updateData.gradoDiscapacidad = data.disabilityDegree || null;
    }
    if (data.cause !== undefined) {
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

