import { ParallelManagement } from '../../domain/entities/ParallelManagement.js';
import { BaseMapper } from './BaseMapper.js';
import { ESTADOS_PARALELO_GESTION } from '../../domain/constants/oferta.constants.js';

export class ParallelManagementMapper {
  static toEntity(model) {
    if (!model) return null;
    const dataValues = model.dataValues || model;
    const specificFields = {};

    if ('gestionPlanId' in dataValues && dataValues.gestionPlanId !== undefined) {
      specificFields.managementPlanId = dataValues.gestionPlanId;
    }
    if ('paraleloId' in dataValues && dataValues.paraleloId !== undefined) {
      specificFields.parallelId = dataValues.paraleloId;
    }
    if ('aulaId' in dataValues && dataValues.aulaId !== undefined) {
      specificFields.classroomId = dataValues.aulaId;
    }
    if ('turno' in dataValues && dataValues.turno !== undefined) {
      specificFields.shift = dataValues.turno;
    }
    if ('estado' in dataValues && dataValues.estado !== undefined) {
      specificFields.state = dataValues.estado;
    }
    if ('cupoMaximo' in dataValues && dataValues.cupoMaximo !== undefined) {
      specificFields.maxCapacity = dataValues.cupoMaximo;
    }
    if ('cupoMinimo' in dataValues && dataValues.cupoMinimo !== undefined) {
      specificFields.minCapacity = dataValues.cupoMinimo;
    }
    if ('observaciones' in dataValues && dataValues.observaciones !== undefined) {
      specificFields.observations = dataValues.observaciones;
    }

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new ParallelManagement(entityData);
  }

  static toModel(entity) {
    const data = entity instanceof ParallelManagement ? entity.toPlainObject() : entity;
    return {
      gestionPlanId: data.managementPlanId ?? null,
      paraleloId: data.parallelId ?? null,
      aulaId: data.classroomId ?? null,
      turno: data.shift,
      estado: data.state || ESTADOS_PARALELO_GESTION.BORRADOR,
      cupoMaximo: data.maxCapacity ?? 35,
      cupoMinimo: data.minCapacity ?? 10,
      observaciones: data.observations ?? null,
    };
  }

  static toModelForUpdate(entity) {
    const data = entity instanceof ParallelManagement ? entity.toPlainObject() : entity;
    const updateData = {};

    if ('managementPlanId' in data) updateData.gestionPlanId = data.managementPlanId ?? null;
    if ('parallelId' in data) updateData.paraleloId = data.parallelId ?? null;
    if ('classroomId' in data) updateData.aulaId = data.classroomId ?? null;
    if ('shift' in data) updateData.turno = data.shift;
    if ('state' in data) updateData.estado = data.state;
    if ('maxCapacity' in data) updateData.cupoMaximo = data.maxCapacity;
    if ('minCapacity' in data) updateData.cupoMinimo = data.minCapacity;
    if ('observations' in data) updateData.observaciones = data.observations ?? null;

    Object.assign(updateData, BaseMapper.baseFieldsToModelForUpdate(entity));
    return updateData;
  }

  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((m) => this.toEntity(m)).filter(Boolean);
  }
}
