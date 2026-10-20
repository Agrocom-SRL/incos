import { TeacherAssignment } from '../../domain/entities/TeacherAssignment.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: TeacherAssignmentMapper
 *
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (TeacherAssignment)
 *
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de TeacherAssignment
 *
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de TeacherAssignment
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 *
 * Clean Architecture:
 * - Domain Layer: TeacherAssignment (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + TeacherAssignmentMapper (campos específicos)
 * - Infrastructure Layer: TeacherAssignmentRepository (usa el mapper para conversiones)
 */
export class TeacherAssignmentMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de TeacherAssignment
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   *
   * Flujo: Base de Datos → ORM Model → Domain Entity
   *
   * @param {Object|null} model - Modelo Sequelize de AsignacionDocente
   * @returns {TeacherAssignment|null} Entidad de dominio TeacherAssignment
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de TeacherAssignment (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};

    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('gestionPlanId' in dataValues && dataValues.gestionPlanId !== undefined) {
      specificFields.managementPlanId = dataValues.gestionPlanId;
    }
    if ('ofertaCursoId' in dataValues && dataValues.ofertaCursoId !== undefined) {
      specificFields.offerCourseId = dataValues.ofertaCursoId;
    }
    if ('cursoId' in dataValues && dataValues.cursoId !== undefined) {
      specificFields.courseId = dataValues.cursoId;
    }
    if ('docenteId' in dataValues && dataValues.docenteId !== undefined) {
      specificFields.teacherId = dataValues.docenteId;
    }
    if ('cargaHoraria' in dataValues && dataValues.cargaHoraria !== undefined) {
      specificFields.hours = dataValues.cargaHoraria;
    }
    if ('vigente' in dataValues && dataValues.vigente !== undefined) {
      specificFields.active = dataValues.vigente;
    }
    if ('motivo' in dataValues && dataValues.motivo !== undefined) {
      specificFields.reason = dataValues.motivo;
    }
    if ('fechaAsignacion' in dataValues && dataValues.fechaAsignacion !== undefined) {
      specificFields.assignmentDate = dataValues.fechaAsignacion;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);

    return new TeacherAssignment(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   *
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   *
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   *
   * @param {TeacherAssignment|Object} entity - Entidad TeacherAssignment o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad TeacherAssignment como objeto plano
    const data = entity instanceof TeacherAssignment ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      gestionPlanId: data.managementPlanId || null,
      ofertaCursoId: data.offerCourseId || null,
      docenteId: data.teacherId || null,
      cargaHoraria: data.hours || null,
      vigente: data.active !== undefined ? data.active : true,
      motivo: data.reason || null,
      fechaAsignacion: data.assignmentDate || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de TeacherAssignment
   *
   * @param {TeacherAssignment|Object} entity - Entidad TeacherAssignment o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad TeacherAssignment como objeto plano
    const data = entity instanceof TeacherAssignment ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de TeacherAssignment
    if (data.managementPlanId !== undefined) {
      updateData.gestionPlanId = data.managementPlanId || null;
    }
    if (data.offerCourseId !== undefined) {
      updateData.ofertaCursoId = data.offerCourseId || null;
    }
    if (data.courseId !== undefined) {
      updateData.cursoId = data.courseId || null;
    }
    if (data.teacherId !== undefined) {
      updateData.docenteId = data.teacherId || null;
    }
    if (data.hours !== undefined) {
      updateData.cargaHoraria = data.hours || null;
    }
    if (data.active !== undefined) {
      updateData.vigente = data.active;
    }
    if (data.reason !== undefined) {
      updateData.motivo = data.reason || null;
    }
    if (data.assignmentDate !== undefined) {
      updateData.fechaAsignacion = data.assignmentDate || null;
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
   * @returns {TeacherAssignment[]} Array de entidades TeacherAssignment
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
