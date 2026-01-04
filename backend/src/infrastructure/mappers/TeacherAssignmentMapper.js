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
   * 
   * @param {Object|null} model - Modelo Sequelize de AsignacionDocente
   * @returns {TeacherAssignment|null} Entidad de dominio TeacherAssignment
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de TeacherAssignment (campos del dominio)
    const specificFields = {
      courseId: model.cursoId,
      managementId: model.gestionId,
      teacherId: model.docenteId,
      weeklyHours: model.cargaHorariaSemanal,
      state: model.estado,
      cancellationReason: model.motivoCancelacion,
      observations: model.observaciones,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new TeacherAssignment(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {TeacherAssignment|Object} entity - Entidad TeacherAssignment o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad TeacherAssignment como objeto plano
    const data = entity instanceof TeacherAssignment ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      cursoId: data.courseId || null,
      gestionId: data.managementId || null,
      docenteId: data.teacherId || null,
      cargaHorariaSemanal: data.weeklyHours !== undefined ? data.weeklyHours : 0,
      estado: data.state || 'PROPUESTA',
      motivoCancelacion: data.cancellationReason || null,
      observaciones: data.observations || null,
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
    if (data.courseId !== undefined) {
      updateData.cursoId = data.courseId || null;
    }
    if (data.managementId !== undefined) {
      updateData.gestionId = data.managementId || null;
    }
    if (data.teacherId !== undefined) {
      updateData.docenteId = data.teacherId || null;
    }
    if (data.weeklyHours !== undefined) {
      updateData.cargaHorariaSemanal = data.weeklyHours;
    }
    if (data.state !== undefined) {
      updateData.estado = data.state;
    }
    if (data.cancellationReason !== undefined) {
      updateData.motivoCancelacion = data.cancellationReason || null;
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
   * @returns {TeacherAssignment[]} Array de entidades TeacherAssignment
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

