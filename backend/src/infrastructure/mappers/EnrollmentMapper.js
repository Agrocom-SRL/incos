import { Enrollment } from '../../domain/entities/Enrollment.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: EnrollmentMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Enrollment)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Enrollment
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Enrollment
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Enrollment (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + EnrollmentMapper (campos específicos)
 * - Infrastructure Layer: EnrollmentRepository (usa el mapper para conversiones)
 */
export class EnrollmentMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Enrollment
   * 
   * @param {Object|null} model - Modelo Sequelize de Inscripcion
   * @returns {Enrollment|null} Entidad de dominio Enrollment
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Enrollment (campos del dominio)
    const specificFields = {
      studentAcademicDataId: model.estudianteDatosAcademicosId,
      managementId: model.gestionId,
      enrollmentType: model.tipoInscripcion,
      enrollmentDate: model.fechaInscripcion,
      observations: model.observaciones,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Enrollment(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Enrollment|Object} entity - Entidad Enrollment o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Enrollment como objeto plano
    const data = entity instanceof Enrollment ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      estudianteDatosAcademicosId: data.studentAcademicDataId || null,
      gestionId: data.managementId || null,
      tipoInscripcion: data.enrollmentType || 'CONTINUIDAD',
      fechaInscripcion: data.enrollmentDate || null,
      observaciones: data.observations || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Enrollment
   * 
   * @param {Enrollment|Object} entity - Entidad Enrollment o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Enrollment como objeto plano
    const data = entity instanceof Enrollment ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Enrollment
    if (data.studentAcademicDataId !== undefined) {
      updateData.estudianteDatosAcademicosId = data.studentAcademicDataId || null;
    }
    if (data.managementId !== undefined) {
      updateData.gestionId = data.managementId || null;
    }
    if (data.enrollmentType !== undefined) {
      updateData.tipoInscripcion = data.enrollmentType;
    }
    if (data.enrollmentDate !== undefined) {
      updateData.fechaInscripcion = data.enrollmentDate || null;
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
   * @returns {Enrollment[]} Array de entidades Enrollment
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
