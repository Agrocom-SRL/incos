import { ContributionConfiguration } from '../../domain/entities/ContributionConfiguration.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: ContributionConfigurationMapper
 * Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (ContributionConfiguration)
 */
export class ContributionConfigurationMapper {
  static toEntity(model) {
    if (!model) return null;

    const dataValues = model.dataValues || model;
    const specificFields = {};

    if ('gestionId' in dataValues && dataValues.gestionId !== undefined) {
      specificFields.managementId = dataValues.gestionId;
    }
    if ('montoBase' in dataValues && dataValues.montoBase !== undefined) {
      specificFields.baseAmount = parseFloat(dataValues.montoBase) || 400.00;
    }
    if ('aporteActivo' in dataValues && dataValues.aporteActivo !== undefined) {
      specificFields.contributionActive = dataValues.aporteActivo;
    }
    if ('fechaInicio' in dataValues && dataValues.fechaInicio !== undefined) {
      specificFields.startDate = dataValues.fechaInicio;
    }
    if ('fechaFin' in dataValues && dataValues.fechaFin !== undefined) {
      specificFields.endDate = dataValues.fechaFin;
    }

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new ContributionConfiguration(entityData);
  }

  static toModel(entity) {
    const data = entity instanceof ContributionConfiguration ? entity.toPlainObject() : entity;
    const modelData = {};

    if ('managementId' in data) {
      modelData.gestionId = data.managementId || null;
    }
    if ('baseAmount' in data) {
      modelData.montoBase = data.baseAmount || 400.00;
    }
    if ('contributionActive' in data) {
      modelData.aporteActivo = data.contributionActive !== undefined ? data.contributionActive : true;
    }
    if ('startDate' in data) {
      modelData.fechaInicio = data.startDate;
    }
    if ('endDate' in data) {
      modelData.fechaFin = data.endDate || null;
    }

    return modelData;
  }

  static toModelForUpdate(entity) {
    const data = entity instanceof ContributionConfiguration ? entity.toPlainObject() : entity;
    const updateData = {};

    if ('managementId' in data) {
      updateData.gestionId = data.managementId || null;
    }
    if ('baseAmount' in data) {
      updateData.montoBase = data.baseAmount;
    }
    if ('contributionActive' in data) {
      updateData.aporteActivo = data.contributionActive;
    }
    if ('startDate' in data) {
      updateData.fechaInicio = data.startDate;
    }
    if ('endDate' in data) {
      updateData.fechaFin = data.endDate || null;
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
