import { Secretary } from '../../domain/entities/Secretary.js';
import { BaseMapper } from './BaseMapper.js';

export class SecretaryMapper {
  static toEntity(model) {
    if (!model) return null;

    const dataValues = model.dataValues || model;
    const specificFields = {};

    if ('personalId' in dataValues && dataValues.personalId !== undefined) {
      specificFields.staffId = dataValues.personalId;
    }
    if ('tipo' in dataValues && dataValues.tipo !== undefined) {
      specificFields.type = dataValues.tipo;
    }
    if ('nivelAcademico' in dataValues && dataValues.nivelAcademico !== undefined) {
      specificFields.academicLevel = dataValues.nivelAcademico;
    }
    if ('fechaContratacion' in dataValues && dataValues.fechaContratacion !== undefined) {
      specificFields.hireDate = dataValues.fechaContratacion;
    }
    if ('fechaFinContrato' in dataValues && dataValues.fechaFinContrato !== undefined) {
      specificFields.contractEndDate = dataValues.fechaFinContrato;
    }
    if ('tipoContrato' in dataValues && dataValues.tipoContrato !== undefined) {
      specificFields.contractType = dataValues.tipoContrato;
    }

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new Secretary(entityData);
  }

  static toModel(entity) {
    const data = entity instanceof Secretary ? entity.toPlainObject() : entity;
    return {
      personalId: data.staffId,
      tipo: data.type,
      nivelAcademico: data.academicLevel,
      fechaContratacion: data.hireDate,
      fechaFinContrato: data.contractEndDate,
      tipoContrato: data.contractType,
    };
  }

  static toModelForUpdate(entity) {
    const data = entity instanceof Secretary ? entity.toPlainObject() : entity;
    const updateData = {};

    if ('staffId' in data) updateData.personalId = data.staffId;
    if ('type' in data) updateData.tipo = data.type;
    if ('academicLevel' in data) updateData.nivelAcademico = data.academicLevel;
    if ('hireDate' in data) updateData.fechaContratacion = data.hireDate;
    if ('contractEndDate' in data) updateData.fechaFinContrato = data.contractEndDate;
    if ('contractType' in data) updateData.tipoContrato = data.contractType;

    Object.assign(updateData, BaseMapper.baseFieldsToModelForUpdate(entity));
    return updateData;
  }

  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((m) => this.toEntity(m)).filter((e) => e !== null);
  }
}
