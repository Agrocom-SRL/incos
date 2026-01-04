import { StudentOrigin } from '../../domain/entities/StudentOrigin.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: StudentOriginMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (StudentOrigin)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de StudentOrigin
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de StudentOrigin
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: StudentOrigin (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + StudentOriginMapper (campos específicos)
 * - Infrastructure Layer: StudentOriginRepository (usa el mapper para conversiones)
 */
export class StudentOriginMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentOrigin
   * 
   * @param {Object|null} model - Modelo Sequelize de EstudianteOrigen
   * @returns {StudentOrigin|null} Entidad de dominio StudentOrigin
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de StudentOrigin (campos del dominio)
    const specificFields = {
      studentId: model.estudianteId,
      countryId: model.paisId,
      birthMunicipalityId: model.municipioNacimientoId,
      birthCity: model.ciudadNacimiento,
      motherTongueId: model.idiomaMaternoId,
      secondaryLanguageId: model.idiomaSecundarioId,
      originType: model.tipoOrigen,
      isPrincipal: model.esPrincipal === 1 || model.esPrincipal === true,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new StudentOrigin(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {StudentOrigin|Object} entity - Entidad StudentOrigin o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad StudentOrigin como objeto plano
    const data = entity instanceof StudentOrigin ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      estudianteId: data.studentId,
      paisId: data.countryId || null,
      municipioNacimientoId: data.birthMunicipalityId || null,
      ciudadNacimiento: data.birthCity || null,
      idiomaMaternoId: data.motherTongueId || null,
      idiomaSecundarioId: data.secondaryLanguageId || null,
      tipoOrigen: data.originType || 'NACIONALIDAD_PRINCIPAL',
      esPrincipal: data.isPrincipal !== undefined ? data.isPrincipal : true,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentOrigin
   * 
   * @param {StudentOrigin|Object} entity - Entidad StudentOrigin o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad StudentOrigin como objeto plano
    const data = entity instanceof StudentOrigin ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de StudentOrigin
    if (data.studentId !== undefined) {
      updateData.estudianteId = data.studentId;
    }
    if (data.countryId !== undefined) {
      updateData.paisId = data.countryId || null;
    }
    if (data.birthMunicipalityId !== undefined) {
      updateData.municipioNacimientoId = data.birthMunicipalityId || null;
    }
    if (data.birthCity !== undefined) {
      updateData.ciudadNacimiento = data.birthCity || null;
    }
    if (data.motherTongueId !== undefined) {
      updateData.idiomaMaternoId = data.motherTongueId || null;
    }
    if (data.secondaryLanguageId !== undefined) {
      updateData.idiomaSecundarioId = data.secondaryLanguageId || null;
    }
    if (data.originType !== undefined) {
      updateData.tipoOrigen = data.originType;
    }
    if (data.isPrincipal !== undefined) {
      updateData.esPrincipal = data.isPrincipal;
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
   * @returns {StudentOrigin[]} Array de entidades StudentOrigin
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

