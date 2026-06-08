import { AsignacionHorario } from '../../domain/entities/AsignacionHorario.js';
import { BaseMapper } from './BaseMapper.js';

export class AsignacionHorarioMapper {
  static toEntity(model) {
    if (!model) return null;

    const dataValues = model.dataValues || model;
    const specificFields = {};

    if ('asignacionDocenteId' in dataValues && dataValues.asignacionDocenteId !== undefined) {
      specificFields.teacherAssignmentId = dataValues.asignacionDocenteId;
    }
    if ('horarioId' in dataValues && dataValues.horarioId !== undefined) {
      specificFields.scheduleId = dataValues.horarioId;
    }
    if ('ordenSecuencia' in dataValues && dataValues.ordenSecuencia !== undefined) {
      specificFields.sequenceOrder = dataValues.ordenSecuencia;
    }

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new AsignacionHorario(entityData);
  }

  static toModel(entity) {
    const data = entity instanceof AsignacionHorario ? entity.toPlainObject() : entity;
    return {
      asignacionDocenteId: data.teacherAssignmentId || null,
      horarioId: data.scheduleId || null,
      ordenSecuencia: data.sequenceOrder !== undefined ? data.sequenceOrder : 1,
    };
  }

  static toModelForUpdate(entity) {
    const data = entity instanceof AsignacionHorario ? entity.toPlainObject() : entity;
    const updateData = {};

    if ('teacherAssignmentId' in data) {
      updateData.asignacionDocenteId = data.teacherAssignmentId || null;
    }
    if ('scheduleId' in data) {
      updateData.horarioId = data.scheduleId || null;
    }
    if ('sequenceOrder' in data) {
      updateData.ordenSecuencia = data.sequenceOrder;
    }

    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);
    return updateData;
  }

  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
