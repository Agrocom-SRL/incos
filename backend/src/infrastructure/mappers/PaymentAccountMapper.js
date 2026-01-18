import { PaymentAccount } from '../../domain/entities/PaymentAccount.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: PaymentAccountMapper
 * Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (PaymentAccount)
 */
export class PaymentAccountMapper {
  static toEntity(model) {
    if (!model) return null;

    const dataValues = model.dataValues || model;
    const specificFields = {};

    if ('metodoPagoId' in dataValues && dataValues.metodoPagoId !== undefined) {
      specificFields.paymentMethodId = dataValues.metodoPagoId;
    }
    if ('bancoId' in dataValues && dataValues.bancoId !== undefined) {
      specificFields.bankId = dataValues.bancoId;
    }
    if ('nombreTitular' in dataValues && dataValues.nombreTitular !== undefined) {
      specificFields.accountHolderName = dataValues.nombreTitular;
    }
    if ('numeroCuenta' in dataValues && dataValues.numeroCuenta !== undefined) {
      specificFields.accountNumber = dataValues.numeroCuenta;
    }
    if ('numeroCelular' in dataValues && dataValues.numeroCelular !== undefined) {
      specificFields.phoneNumber = dataValues.numeroCelular;
    }
    if ('qrImagenUrl' in dataValues && dataValues.qrImagenUrl !== undefined) {
      specificFields.qrImageUrl = dataValues.qrImagenUrl;
    }

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new PaymentAccount(entityData);
  }

  static toModel(entity) {
    const data = entity instanceof PaymentAccount ? entity.toPlainObject() : entity;
    const modelData = {};

    if ('paymentMethodId' in data) {
      modelData.metodoPagoId = data.paymentMethodId || null;
    }
    if ('bankId' in data) {
      modelData.bancoId = data.bankId || null;
    }
    if ('accountHolderName' in data) {
      modelData.nombreTitular = data.accountHolderName;
    }
    if ('accountNumber' in data) {
      modelData.numeroCuenta = data.accountNumber || null;
    }
    if ('phoneNumber' in data) {
      modelData.numeroCelular = data.phoneNumber || null;
    }
    if ('qrImageUrl' in data) {
      modelData.qrImagenUrl = data.qrImageUrl || null;
    }

    return modelData;
  }

  static toModelForUpdate(entity) {
    const data = entity instanceof PaymentAccount ? entity.toPlainObject() : entity;
    const updateData = {};

    if ('paymentMethodId' in data) {
      updateData.metodoPagoId = data.paymentMethodId || null;
    }
    if ('bankId' in data) {
      updateData.bancoId = data.bankId || null;
    }
    if ('accountHolderName' in data) {
      updateData.nombreTitular = data.accountHolderName;
    }
    if ('accountNumber' in data) {
      updateData.numeroCuenta = data.accountNumber || null;
    }
    if ('phoneNumber' in data) {
      updateData.numeroCelular = data.phoneNumber || null;
    }
    if ('qrImageUrl' in data) {
      updateData.qrImagenUrl = data.qrImageUrl || null;
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
