import { CourseSchedule } from '../../domain/entities/CourseSchedule.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: CourseScheduleMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (CourseSchedule)
 */
export class CourseScheduleMapper {
  static toEntity(model) {
    if (!model) return null;

    const specificFields = {
      courseId: model.cursoId,
      scheduleId: model.horarioId,
      classroomId: model.aulaId,
      sequenceOrder: model.ordenSecuencia,
    };

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new CourseSchedule(entityData);
  }

  static toModel(entity) {
    const data = entity instanceof CourseSchedule ? entity.toPlainObject() : entity;

    return {
      cursoId: data.courseId || null,
      horarioId: data.scheduleId || null,
      aulaId: data.classroomId || null,
      ordenSecuencia: data.sequenceOrder !== undefined ? data.sequenceOrder : 1,
    };
  }

  static toModelForUpdate(entity) {
    const data = entity instanceof CourseSchedule ? entity.toPlainObject() : entity;
    const updateData = {};

    if (data.courseId !== undefined) { updateData.cursoId = data.courseId || null; }
    if (data.scheduleId !== undefined) { updateData.horarioId = data.scheduleId || null; }
    if (data.classroomId !== undefined) { updateData.aulaId = data.classroomId || null; }
    if (data.sequenceOrder !== undefined) { updateData.ordenSecuencia = data.sequenceOrder; }

    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
