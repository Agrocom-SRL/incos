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
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de InscripcionMateria
   * @returns {EnrollmentSubject|null} Entidad de dominio EnrollmentSubject
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de EnrollmentSubject (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};
    
    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('inscripcionId' in dataValues && dataValues.inscripcionId !== undefined) {
      specificFields.enrollmentId = dataValues.inscripcionId;
    }
    if ('asignacionDocenteId' in dataValues && dataValues.asignacionDocenteId !== undefined) {
      specificFields.teacherAssignmentId = dataValues.asignacionDocenteId;
    }
    if ('notaFinal' in dataValues && dataValues.notaFinal !== undefined) {
      specificFields.finalGrade = dataValues.notaFinal ? parseFloat(dataValues.notaFinal) : null;
    }
    if ('notaDefinitiva' in dataValues && dataValues.notaDefinitiva !== undefined) {
      specificFields.definitiveGrade = dataValues.notaDefinitiva ? parseFloat(dataValues.notaDefinitiva) : null;
    }
    if ('estado' in dataValues && dataValues.estado !== undefined) {
      specificFields.status = dataValues.estado;
    }
    if ('observaciones' in dataValues && dataValues.observaciones !== undefined) {
      specificFields.observations = dataValues.observaciones;
    }
    if ('observacionesDocente' in dataValues && dataValues.observacionesDocente !== undefined) {
      specificFields.teacherObservations = dataValues.observacionesDocente;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new EnrollmentSubject(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {EnrollmentSubject|Object} entity - Entidad EnrollmentSubject o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad EnrollmentSubject como objeto plano
    const data = entity instanceof EnrollmentSubject ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
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
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de EnrollmentSubject
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {EnrollmentSubject|Object} entity - Entidad EnrollmentSubject o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad EnrollmentSubject como objeto plano
    const data = entity instanceof EnrollmentSubject ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de EnrollmentSubject
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('enrollmentId' in data) {
      updateData.inscripcionId = data.enrollmentId || null;
    }
    if ('teacherAssignmentId' in data) {
      updateData.asignacionDocenteId = data.teacherAssignmentId || null;
    }
    if ('finalGrade' in data) {
      updateData.notaFinal = data.finalGrade || null;
    }
    if ('definitiveGrade' in data) {
      updateData.notaDefinitiva = data.definitiveGrade || null;
    }
    if ('status' in data) {
      updateData.estado = data.status;
    }
    if ('observations' in data) {
      updateData.observaciones = data.observations || null;
    }
    if ('teacherObservations' in data) {
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
