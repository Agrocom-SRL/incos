import { CourseOffer } from '../../domain/entities/CourseOffer.js';
import { BaseMapper } from './BaseMapper.js';
import { ESTADOS_OFERTA_CURSO } from '../../domain/constants/oferta.constants.js';

export class CourseOfferMapper {
  static toEntity(model) {
    if (!model) return null;
    const dataValues = model.dataValues || model;
    const specificFields = {};

    if ('paraleloGestionId' in dataValues && dataValues.paraleloGestionId !== undefined) {
      specificFields.parallelManagementId = dataValues.paraleloGestionId;
    }
    if ('asignaturaPlanId' in dataValues && dataValues.asignaturaPlanId !== undefined) {
      specificFields.planSubjectId = dataValues.asignaturaPlanId;
    }
    if ('estado' in dataValues && dataValues.estado !== undefined) {
      specificFields.state = dataValues.estado;
    }
    if ('observaciones' in dataValues && dataValues.observaciones !== undefined) {
      specificFields.observations = dataValues.observaciones;
    }

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new CourseOffer(entityData);
  }

  static toModel(entity) {
    const data = entity instanceof CourseOffer ? entity.toPlainObject() : entity;
    return {
      paraleloGestionId: data.parallelManagementId ?? null,
      asignaturaPlanId: data.planSubjectId ?? null,
      estado: data.state || ESTADOS_OFERTA_CURSO.PROGRAMADA,
      observaciones: data.observations ?? null,
    };
  }

  static toModelForUpdate(entity) {
    const data = entity instanceof CourseOffer ? entity.toPlainObject() : entity;
    const updateData = {};

    if ('parallelManagementId' in data) {
      updateData.paraleloGestionId = data.parallelManagementId ?? null;
    }
    if ('planSubjectId' in data) updateData.asignaturaPlanId = data.planSubjectId ?? null;
    if ('state' in data) updateData.estado = data.state;
    if ('observations' in data) updateData.observaciones = data.observations ?? null;

    Object.assign(updateData, BaseMapper.baseFieldsToModelForUpdate(entity));
    return updateData;
  }

  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((m) => this.toEntity(m)).filter(Boolean);
  }
}
