import { ContributionPayment } from '../../domain/entities/ContributionPayment.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: ContributionPaymentMapper
 * Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (ContributionPayment)
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
    if ('inscripcionId' in dataValues && dataValues.inscripcionId !== undefined) {
      specificFields.enrollmentId = dataValues.inscripcionId;
    }
    if ('estudianteBecaId' in dataValues && dataValues.estudianteBecaId !== undefined) {
      specificFields.studentScholarshipId = dataValues.estudianteBecaId;
    }
    if ('metodoPagoId' in dataValues && dataValues.metodoPagoId !== undefined) {
      specificFields.paymentMethodId = dataValues.metodoPagoId;
    }
    if ('cuentaPagoId' in dataValues && dataValues.cuentaPagoId !== undefined) {
      specificFields.paymentAccountId = dataValues.cuentaPagoId;
    }
    if ('numeroRecibo' in dataValues && dataValues.numeroRecibo !== undefined) {
      specificFields.receiptNumber = dataValues.numeroRecibo;
    }
    if ('fechaPago' in dataValues && dataValues.fechaPago !== undefined) {
      specificFields.paymentDate = dataValues.fechaPago;
    }
    if ('montoTotal' in dataValues && dataValues.montoTotal !== undefined) {
      specificFields.totalAmount = parseFloat(dataValues.montoTotal) || 0;
    }
    if ('descuentoBeca' in dataValues && dataValues.descuentoBeca !== undefined) {
      specificFields.scholarshipDiscount = parseFloat(dataValues.descuentoBeca) || 0;
    }
    if ('montoPagado' in dataValues && dataValues.montoPagado !== undefined) {
      specificFields.amountPaid = parseFloat(dataValues.montoPagado) || 0;
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
    return new ContributionPayment(entityData);
  }

  static toModel(entity) {
    const data = entity instanceof ContributionPayment ? entity.toPlainObject() : entity;
    const modelData = {};

    if ('studentId' in data) {
      modelData.estudianteId = data.studentId || null;
    }
    if ('managementId' in data) {
      modelData.gestionId = data.managementId || null;
    }
    if ('enrollmentId' in data) {
      modelData.inscripcionId = data.enrollmentId || null;
    }
    if ('studentScholarshipId' in data) {
      modelData.estudianteBecaId = data.studentScholarshipId || null;
    }
    if ('paymentMethodId' in data) {
      modelData.metodoPagoId = data.paymentMethodId || null;
    }
    if ('paymentAccountId' in data) {
      modelData.cuentaPagoId = data.paymentAccountId || null;
    }
    if ('receiptNumber' in data) {
      modelData.numeroRecibo = data.receiptNumber || null;
    }
    if ('paymentDate' in data) {
      modelData.fechaPago = data.paymentDate;
    }
    if ('totalAmount' in data) {
      modelData.montoTotal = data.totalAmount || 0;
    }
    if ('scholarshipDiscount' in data) {
      modelData.descuentoBeca = data.scholarshipDiscount || 0.00;
    }
    if ('amountPaid' in data) {
      modelData.montoPagado = data.amountPaid || 0;
    }
    if ('transactionNumber' in data) {
      modelData.numeroTransaccion = data.transactionNumber || null;
    }
    if ('comprobanteCode' in data) {
      modelData.codigoComprobante = data.comprobanteCode || null;
    }
    if ('description' in data) {
      modelData.descripcion = data.description || null;
    }

    return modelData;
  }

  static toModelForUpdate(entity) {
    const data = entity instanceof ContributionPayment ? entity.toPlainObject() : entity;
    const updateData = {};

    if ('studentId' in data) {
      updateData.estudianteId = data.studentId || null;
    }
    if ('managementId' in data) {
      updateData.gestionId = data.managementId || null;
    }
    if ('enrollmentId' in data) {
      updateData.inscripcionId = data.enrollmentId || null;
    }
    if ('studentScholarshipId' in data) {
      updateData.estudianteBecaId = data.studentScholarshipId || null;
    }
    if ('paymentMethodId' in data) {
      updateData.metodoPagoId = data.paymentMethodId || null;
    }
    if ('paymentAccountId' in data) {
      updateData.cuentaPagoId = data.paymentAccountId || null;
    }
    if ('receiptNumber' in data) {
      updateData.numeroRecibo = data.receiptNumber || null;
    }
    if ('paymentDate' in data) {
      updateData.fechaPago = data.paymentDate;
    }
    if ('totalAmount' in data) {
      updateData.montoTotal = data.totalAmount;
    }
    if ('scholarshipDiscount' in data) {
      updateData.descuentoBeca = data.scholarshipDiscount;
    }
    if ('amountPaid' in data) {
      updateData.montoPagado = data.amountPaid;
    }
    if ('transactionNumber' in data) {
      updateData.numeroTransaccion = data.transactionNumber || null;
    }
    if ('comprobanteCode' in data) {
      updateData.codigoComprobante = data.comprobanteCode || null;
    }
    if ('description' in data) {
      updateData.descripcion = data.description || null;
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
