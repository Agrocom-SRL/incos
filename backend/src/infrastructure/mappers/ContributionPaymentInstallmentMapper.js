import { ContributionPaymentInstallment } from '../../domain/entities/ContributionPaymentInstallment.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: ContributionPaymentInstallmentMapper
 * Conversión entre Modelo ORM pago_cuotas (Sequelize) ↔ Entidad de Dominio (ContributionPaymentInstallment)
 * Cada registro es una cuota (pago) contra una cabecera de aporte.
 */
export class ContributionPaymentInstallmentMapper {
  static toEntity(model) {
    if (!model) return null;

    const dataValues = model.dataValues || model;
    const specificFields = {};

    if ('pagoAporteId' in dataValues && dataValues.pagoAporteId !== undefined) {
      specificFields.contributionPaymentId = dataValues.pagoAporteId;
    }
    if ('numeroRecibo' in dataValues && dataValues.numeroRecibo !== undefined) {
      specificFields.receiptNumber = dataValues.numeroRecibo;
    }
    if ('fechaPago' in dataValues && dataValues.fechaPago !== undefined) {
      specificFields.paymentDate = dataValues.fechaPago;
    }
    if ('monto' in dataValues && dataValues.monto !== undefined) {
      specificFields.amount = parseFloat(dataValues.monto) ?? 0;
    }
    if ('metodoPagoId' in dataValues && dataValues.metodoPagoId !== undefined) {
      specificFields.paymentMethodId = dataValues.metodoPagoId;
    }
    if ('cuentaPagoId' in dataValues && dataValues.cuentaPagoId !== undefined) {
      specificFields.paymentAccountId = dataValues.cuentaPagoId;
    }
    if ('numeroTransaccion' in dataValues && dataValues.numeroTransaccion !== undefined) {
      specificFields.transactionNumber = dataValues.numeroTransaccion;
    }
    if ('codigoComprobante' in dataValues && dataValues.codigoComprobante !== undefined) {
      specificFields.comprobanteCode = dataValues.codigoComprobante;
    }
    if ('descripcion' in dataValues && dataValues.descripcion !== undefined) {
      specificFields.description = dataValues.descripcion;
    }

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return entityData ? new ContributionPaymentInstallment(entityData) : null;
  }

  static toModel(entity) {
    const data = entity instanceof ContributionPaymentInstallment ? entity.toPlainObject() : entity;
    const modelData = {};

    if ('contributionPaymentId' in data) {
      modelData.pagoAporteId = data.contributionPaymentId ?? null;
    }
    if ('receiptNumber' in data) {
      modelData.numeroRecibo = data.receiptNumber ?? null;
    }
    if ('paymentDate' in data) {
      modelData.fechaPago = data.paymentDate;
    }
    if ('amount' in data) {
      modelData.monto = data.amount ?? 0;
    }
    if ('paymentMethodId' in data) {
      modelData.metodoPagoId = data.paymentMethodId ?? null;
    }
    if ('paymentAccountId' in data) {
      modelData.cuentaPagoId = data.paymentAccountId ?? null;
    }
    if ('transactionNumber' in data) {
      modelData.numeroTransaccion = data.transactionNumber ?? null;
    }
    if ('comprobanteCode' in data) {
      modelData.codigoComprobante = data.comprobanteCode ?? null;
    }
    if ('description' in data) {
      modelData.descripcion = data.description ?? null;
    }

    return modelData;
  }

  static toModelForUpdate(entity) {
    const data = entity instanceof ContributionPaymentInstallment ? entity.toPlainObject() : entity;
    const updateData = {};

    if ('contributionPaymentId' in data) {
      updateData.pagoAporteId = data.contributionPaymentId ?? null;
    }
    if ('receiptNumber' in data) {
      updateData.numeroRecibo = data.receiptNumber;
    }
    if ('paymentDate' in data) {
      updateData.fechaPago = data.paymentDate;
    }
    if ('amount' in data) {
      updateData.monto = data.amount;
    }
    if ('paymentMethodId' in data) {
      updateData.metodoPagoId = data.paymentMethodId ?? null;
    }
    if ('paymentAccountId' in data) {
      updateData.cuentaPagoId = data.paymentAccountId ?? null;
    }
    if ('transactionNumber' in data) {
      updateData.numeroTransaccion = data.transactionNumber ?? null;
    }
    if ('comprobanteCode' in data) {
      updateData.codigoComprobante = data.comprobanteCode ?? null;
    }
    if ('description' in data) {
      updateData.descripcion = data.description ?? null;
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
