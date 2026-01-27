import { ContributionPayment } from '../../domain/entities/ContributionPayment.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: ContributionPaymentMapper
 * Conversión entre Modelo ORM pago_aporte (Sequelize) ↔ Entidad de Dominio (ContributionPayment)
 * Cabecera del aporte académico por estudiante y gestión.
 */
export class ContributionPaymentMapper {
  static toEntity(model) {
    if (!model) return null;

    const dataValues = model.dataValues || model;
    const specificFields = {};

    if ('estudianteId' in dataValues && dataValues.estudianteId !== undefined) {
      specificFields.studentId = dataValues.estudianteId;
    }
    if ('gestionId' in dataValues && dataValues.gestionId !== undefined) {
      specificFields.managementId = dataValues.gestionId;
    }
    if ('estudianteBecaId' in dataValues && dataValues.estudianteBecaId !== undefined) {
      specificFields.studentScholarshipId = dataValues.estudianteBecaId;
    }
    if ('montoBase' in dataValues && dataValues.montoBase !== undefined) {
      specificFields.baseAmount = parseFloat(dataValues.montoBase) ?? 0;
    }
    if ('descuentoBeca' in dataValues && dataValues.descuentoBeca !== undefined) {
      specificFields.scholarshipDiscount = parseFloat(dataValues.descuentoBeca) ?? 0;
    }
    if ('montoObligatorio' in dataValues && dataValues.montoObligatorio !== undefined) {
      specificFields.mandatoryAmount = parseFloat(dataValues.montoObligatorio) ?? 0;
    }
    if ('estado' in dataValues && dataValues.estado !== undefined) {
      specificFields.state = dataValues.estado;
    }

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return entityData ? new ContributionPayment(entityData) : null;
  }

  static toModel(entity) {
    const data = entity instanceof ContributionPayment ? entity.toPlainObject() : entity;
    const modelData = {};

    if ('studentId' in data) {
      modelData.estudianteId = data.studentId ?? null;
    }
    if ('managementId' in data) {
      modelData.gestionId = data.managementId ?? null;
    }
    if ('studentScholarshipId' in data) {
      modelData.estudianteBecaId = data.studentScholarshipId ?? null;
    }
    if ('baseAmount' in data) {
      modelData.montoBase = data.baseAmount ?? 0;
    }
    if ('scholarshipDiscount' in data) {
      modelData.descuentoBeca = data.scholarshipDiscount ?? 0;
    }
    if ('mandatoryAmount' in data) {
      modelData.montoObligatorio = data.mandatoryAmount ?? 0;
    }
    if ('state' in data) {
      modelData.estado = data.state ?? null;
    }

    return modelData;
  }

  static toModelForUpdate(entity) {
    const data = entity instanceof ContributionPayment ? entity.toPlainObject() : entity;
    const updateData = {};

    if ('studentId' in data) {
      updateData.estudianteId = data.studentId ?? null;
    }
    if ('managementId' in data) {
      updateData.gestionId = data.managementId ?? null;
    }
    if ('studentScholarshipId' in data) {
      updateData.estudianteBecaId = data.studentScholarshipId ?? null;
    }
    if ('baseAmount' in data) {
      updateData.montoBase = data.baseAmount;
    }
    if ('scholarshipDiscount' in data) {
      updateData.descuentoBeca = data.scholarshipDiscount;
    }
    if ('mandatoryAmount' in data) {
      updateData.montoObligatorio = data.mandatoryAmount;
    }
    if ('state' in data) {
      updateData.estado = data.state;
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
