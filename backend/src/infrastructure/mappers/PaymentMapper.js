import { Payment } from '../../domain/entities/Payment.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: PaymentMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Payment)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Payment
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Payment
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Payment (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + PaymentMapper (campos específicos)
 * - Infrastructure Layer: PaymentRepository (usa el mapper para conversiones)
 */
export class PaymentMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Payment
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de PagoArancel
   * @returns {Payment|null} Entidad de dominio Payment
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Payment (campos del dominio)
    const dataValues = model.dataValues || model;
    const specificFields = {};

    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('estudianteId' in dataValues && dataValues.estudianteId !== undefined) {
      specificFields.studentId = dataValues.estudianteId;
    }
    if ('inscripcionId' in dataValues && dataValues.inscripcionId !== undefined) {
      specificFields.enrollmentId = dataValues.inscripcionId;
    }
    if ('gestionId' in dataValues && dataValues.gestionId !== undefined) {
      specificFields.managementId = dataValues.gestionId;
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
    if ('descuentoOtros' in dataValues && dataValues.descuentoOtros !== undefined) {
      specificFields.otherDiscount = parseFloat(dataValues.descuentoOtros) || 0;
    }
    if ('montoPagado' in dataValues && dataValues.montoPagado !== undefined) {
      specificFields.amountPaid = parseFloat(dataValues.montoPagado) || 0;
    }
    if ('metodoPago' in dataValues && dataValues.metodoPago !== undefined) {
      specificFields.paymentMethod = dataValues.metodoPago;
    }
    if ('numeroTransaccion' in dataValues && dataValues.numeroTransaccion !== undefined) {
      specificFields.transactionNumber = dataValues.numeroTransaccion;
    }
    if ('banco' in dataValues && dataValues.banco !== undefined) {
      specificFields.bank = dataValues.banco;
    }
    if ('concepto' in dataValues && dataValues.concepto !== undefined) {
      specificFields.concept = dataValues.concepto;
    }
    if ('periodoPago' in dataValues && dataValues.periodoPago !== undefined) {
      specificFields.paymentPeriod = dataValues.periodoPago;
    }
    if ('estado' in dataValues && dataValues.estado !== undefined) {
      specificFields.state = dataValues.estado;
    }
    if ('fechaVencimiento' in dataValues && dataValues.fechaVencimiento !== undefined) {
      specificFields.dueDate = dataValues.fechaVencimiento;
    }
    if ('validado' in dataValues && dataValues.validado !== undefined) {
      specificFields.validated = dataValues.validado === 1 || dataValues.validado === true;
    }
    if ('validadoPor' in dataValues && dataValues.validadoPor !== undefined) {
      specificFields.validatedBy = dataValues.validadoPor;
    }
    if ('fechaValidacion' in dataValues && dataValues.fechaValidacion !== undefined) {
      specificFields.validationDate = dataValues.fechaValidacion;
    }
    if ('comprobanteUrl' in dataValues && dataValues.comprobanteUrl !== undefined) {
      specificFields.receiptUrl = dataValues.comprobanteUrl;
    }
    if ('observaciones' in dataValues && dataValues.observaciones !== undefined) {
      specificFields.observations = dataValues.observaciones;
    }
    if ('motivoAnulacion' in dataValues && dataValues.motivoAnulacion !== undefined) {
      specificFields.cancellationReason = dataValues.motivoAnulacion;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);

    return new Payment(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * @param {Payment|Object} entity - Entidad Payment o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModel(entity) {
    // Acepta tanto entidad Payment como objeto plano
    const data = entity instanceof Payment ? entity.toPlainObject() : entity;
    const modelData = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('studentId' in data) {
      modelData.estudianteId = data.studentId || null;
    }
    if ('enrollmentId' in data) {
      modelData.inscripcionId = data.enrollmentId || null;
    }
    // gestionId es opcional/redundante (ya está en inscripcion_id)
    // Solo incluirlo si se proporciona explícitamente
    if ('managementId' in data && data.managementId !== undefined) {
      modelData.gestionId = data.managementId;
    }
    if ('receiptNumber' in data) {
      modelData.numeroRecibo = data.receiptNumber || null;
    }
    if ('paymentDate' in data) {
      modelData.fechaPago = data.paymentDate;
    }
    if ('totalAmount' in data) {
      modelData.montoTotal = data.totalAmount || 400.00;
    }
    if ('scholarshipDiscount' in data) {
      modelData.descuentoBeca = data.scholarshipDiscount || 0.00;
    }
    if ('otherDiscount' in data) {
      modelData.descuentoOtros = data.otherDiscount || 0.00;
    }
    if ('amountPaid' in data) {
      modelData.montoPagado = data.amountPaid || 0.00;
    }
    if ('paymentMethod' in data) {
      modelData.metodoPago = data.paymentMethod;
    }
    if ('transactionNumber' in data) {
      modelData.numeroTransaccion = data.transactionNumber || null;
    }
    if ('bank' in data) {
      modelData.banco = data.bank || null;
    }
    if ('concept' in data) {
      modelData.concepto = data.concept || null;
    }
    if ('paymentPeriod' in data) {
      modelData.periodoPago = data.paymentPeriod || null;
    }
    if ('state' in data) {
      modelData.estado = data.state;
    }
    if ('dueDate' in data) {
      modelData.fechaVencimiento = data.dueDate || null;
    }
    if ('validated' in data) {
      modelData.validado = data.validated || false;
    }
    if ('validatedBy' in data) {
      modelData.validadoPor = data.validatedBy || null;
    }
    if ('validationDate' in data) {
      modelData.fechaValidacion = data.validationDate || null;
    }
    if ('receiptUrl' in data) {
      modelData.comprobanteUrl = data.receiptUrl || null;
    }
    if ('observations' in data) {
      modelData.observaciones = data.observations || null;
    }
    if ('cancellationReason' in data) {
      modelData.motivoAnulacion = data.cancellationReason || null;
    }

    return modelData;
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {Payment|Object} entity - Entidad Payment o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Payment como objeto plano
    const data = entity instanceof Payment ? entity.toPlainObject() : entity;
    const updateData = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('studentId' in data) {
      updateData.estudianteId = data.studentId || null;
    }
    if ('enrollmentId' in data) {
      updateData.inscripcionId = data.enrollmentId || null;
    }
    if ('managementId' in data) {
      updateData.gestionId = data.managementId || null;
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
    if ('otherDiscount' in data) {
      updateData.descuentoOtros = data.otherDiscount;
    }
    if ('amountPaid' in data) {
      updateData.montoPagado = data.amountPaid;
    }
    if ('paymentMethod' in data) {
      updateData.metodoPago = data.paymentMethod;
    }
    if ('transactionNumber' in data) {
      updateData.numeroTransaccion = data.transactionNumber || null;
    }
    if ('bank' in data) {
      updateData.banco = data.bank || null;
    }
    if ('concept' in data) {
      updateData.concepto = data.concept || null;
    }
    if ('paymentPeriod' in data) {
      updateData.periodoPago = data.paymentPeriod || null;
    }
    if ('state' in data) {
      updateData.estado = data.state;
    }
    if ('dueDate' in data) {
      updateData.fechaVencimiento = data.dueDate || null;
    }
    if ('validated' in data) {
      updateData.validado = data.validated;
    }
    if ('validatedBy' in data) {
      updateData.validadoPor = data.validatedBy || null;
    }
    if ('validationDate' in data) {
      updateData.fechaValidacion = data.validationDate || null;
    }
    if ('receiptUrl' in data) {
      updateData.comprobanteUrl = data.receiptUrl || null;
    }
    if ('observations' in data) {
      updateData.observaciones = data.observations || null;
    }
    if ('cancellationReason' in data) {
      updateData.motivoAnulacion = data.cancellationReason || null;
    }

    // Campos base (active/activo)
    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  /**
   * Convierte un array de modelos Sequelize a array de entidades de dominio
   * 
   * @param {Array} models - Array de modelos Sequelize
   * @returns {Payment[]} Array de entidades Payment
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
