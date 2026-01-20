/**
 * Mapper de aplicación: ContributionPayment
 * Convierte entidades de dominio (ContributionPayment) a formato de presentación (API/Spanish)
 * 
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (ContributionPayment entity)
 * - Usa BaseMapper para campos comunes
 * 
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

import { BaseMapper } from '../base/index.js';

/**
 * Convierte una entidad ContributionPayment a formato de presentación
 * Solo incluye campos que existen en la entidad (útil cuando se usan attributes limitados)
 * 
 * @param {ContributionPayment} payment - Entidad de dominio ContributionPayment
 * @returns {Object|null} Objeto en formato de presentación o null si payment es null/undefined
 */
export function entityToPresentation(payment) {
  if (!payment) return null;

  const presentation = {};
  
  // Mapear campos base comunes (id, active, createdAt, updatedAt)
  BaseMapper.mapBaseFields(payment, presentation);
  
  // Mapear campos específicos de ContributionPayment
  // Usar verificación más robusta que funcione con objetos planos y entidades
  if (payment.studentId !== undefined) {
    presentation.student_id = payment.studentId;
  }
  if (payment.managementId !== undefined) {
    presentation.management_id = payment.managementId;
  }
  if (payment.enrollmentId !== undefined) {
    presentation.enrollment_id = payment.enrollmentId;
  }
  if (payment.studentScholarshipId !== undefined) {
    presentation.student_scholarship_id = payment.studentScholarshipId;
  }
  if (payment.paymentMethodId !== undefined) {
    presentation.payment_method_id = payment.paymentMethodId;
  }
  if (payment.paymentAccountId !== undefined) {
    presentation.payment_account_id = payment.paymentAccountId;
  }
  if (payment.receiptNumber !== undefined) {
    presentation.receipt_number = payment.receiptNumber;
  }
  if (payment.paymentDate !== undefined) {
    presentation.payment_date = payment.paymentDate;
  }
  if (payment.totalAmount !== undefined) {
    presentation.total_amount = payment.totalAmount;
  }
  if (payment.scholarshipDiscount !== undefined) {
    presentation.scholarship_discount = payment.scholarshipDiscount;
  }
  if (payment.amountPaid !== undefined) {
    presentation.amount_paid = payment.amountPaid;
  }
  if (payment.transactionNumber !== undefined) {
    presentation.transaction_number = payment.transactionNumber;
  }
  if (payment.concept !== undefined) {
    presentation.concept = payment.concept;
  }
  if (payment.observations !== undefined) {
    presentation.observations = payment.observations;
  }

  return presentation;
}

/**
 * Convierte un array de entidades ContributionPayment a formato de presentación
 * @param {ContributionPayment[]} payments - Array de entidades de dominio ContributionPayment
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(payments) {
  if (!Array.isArray(payments)) return [];
  return payments.map(entityToPresentation);
}

/**
 * Clase mapper para ContributionPayment (exportada por compatibilidad)
 */
export class ContributionPaymentMapper {
  static entityToPresentation(payment) {
    return entityToPresentation(payment);
  }

  static entitiesToPresentation(payments) {
    return entitiesToPresentation(payments);
  }
}
