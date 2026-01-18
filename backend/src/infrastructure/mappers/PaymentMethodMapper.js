import { PaymentMethod } from '../../domain/entities/PaymentMethod.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: PaymentMethodMapper
 * Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (PaymentMethod)
 */
export class PaymentMethodMapper {
  static toEntity(model) {
    if (!model) return null;

    const dataValues = model.dataValues || model;
    const specificFields = {};

    if ('codigo' in dataValues && dataValues.codigo !== undefined) {
      specificFields.code = dataValues.codigo;
    }
    if ('nombre' in dataValues && dataValues.nombre !== undefined) {
      specificFields.name = dataValues.nombre;
    }

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new PaymentMethod(entityData);
  }

  static toModel(entity) {
    const data = entity instanceof PaymentMethod ? entity.toPlainObject() : entity;
    const modelData = {};

    if ('code' in data) {
      modelData.codigo = data.code;
    }
    if ('name' in data) {
      modelData.nombre = data.name;
    }

    return modelData;
  }

  static toModelForUpdate(entity) {
    const data = entity instanceof PaymentMethod ? entity.toPlainObject() : entity;
    const updateData = {};

    if ('code' in data) {
      updateData.codigo = data.code;
    }
    if ('name' in data) {
      updateData.nombre = data.name;
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
