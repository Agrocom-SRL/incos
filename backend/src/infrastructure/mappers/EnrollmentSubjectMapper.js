import { EnrollmentSubject } from '../../domain/entities/EnrollmentSubject.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: EnrollmentSubjectMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (EnrollmentSubject)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de EnrollmentSubject
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de EnrollmentSubject
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: EnrollmentSubject (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + EnrollmentSubjectMapper (campos específicos)
 * - Infrastructure Layer: EnrollmentSubjectRepository (usa el mapper para conversiones)
 */
export class EnrollmentSubjectMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de EnrollmentSubject
   * 
   * @param {Object|null} model - Modelo Sequelize de InscripcionMateria
   * @returns {EnrollmentSubject|null} Entidad de dominio EnrollmentSubject
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de EnrollmentSubject (campos del dominio)
    const specificFields = {
      enrollmentId: model.inscripcionId,
      teacherAssignmentId: model.asignacionDocenteId,
      finalGrade: model.notaFinal ? parseFloat(model.notaFinal) : null,
      definitiveGrade: model.notaDefinitiva ? parseFloat(model.notaDefinitiva) : null,
      status: model.estado,
      observations: model.observaciones,
      teacherObservations: model.observacionesDocente,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new EnrollmentSubject(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {EnrollmentSubject|Object} entity - Entidad EnrollmentSubject o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad EnrollmentSubject como objeto plano
    const data = entity instanceof EnrollmentSubject ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      inscripcionId: data.enrollmentId || null,
      asignacionDocenteId: data.teacherAssignmentId || null,
      notaFinal: data.finalGrade || null,
      notaDefinitiva: data.definitiveGrade || null,
      estado: data.status || 'INSCRITO',
      observaciones: data.observations || null,
      observacionesDocente: data.teacherObservations || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de EnrollmentSubject
   * 
   * @param {EnrollmentSubject|Object} entity - Entidad EnrollmentSubject o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad EnrollmentSubject como objeto plano
    const data = entity instanceof EnrollmentSubject ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de EnrollmentSubject
    if (data.enrollmentId !== undefined) {
      updateData.inscripcionId = data.enrollmentId || null;
    }
    if (data.teacherAssignmentId !== undefined) {
      updateData.asignacionDocenteId = data.teacherAssignmentId || null;
    }
    if (data.finalGrade !== undefined) {
      updateData.notaFinal = data.finalGrade || null;
    }
    if (data.definitiveGrade !== undefined) {
      updateData.notaDefinitiva = data.definitiveGrade || null;
    }
    if (data.status !== undefined) {
      updateData.estado = data.status;
    }
    if (data.observations !== undefined) {
      updateData.observaciones = data.observations || null;
    }
    if (data.teacherObservations !== undefined) {
      updateData.observacionesDocente = data.teacherObservations || null;
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
   * @returns {EnrollmentSubject[]} Array de entidades EnrollmentSubject
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
