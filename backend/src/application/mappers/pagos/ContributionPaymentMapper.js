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
  // Solo incluir campos que existen en la entidad (usando mapFieldIfExists)
  BaseMapper.mapFieldIfExists(payment, 'studentId', 'student_id', presentation);
  BaseMapper.mapFieldIfExists(payment, 'managementId', 'management_id', presentation);
  BaseMapper.mapFieldIfExists(payment, 'enrollmentId', 'enrollment_id', presentation);
  BaseMapper.mapFieldIfExists(payment, 'studentScholarshipId', 'student_scholarship_id', presentation);
  BaseMapper.mapFieldIfExists(payment, 'paymentMethodId', 'payment_method_id', presentation);
  BaseMapper.mapFieldIfExists(payment, 'paymentAccountId', 'payment_account_id', presentation);
  BaseMapper.mapFieldIfExists(payment, 'receiptNumber', 'receipt_number', presentation);
  BaseMapper.mapFieldIfExists(payment, 'paymentDate', 'payment_date', presentation);
  BaseMapper.mapFieldIfExists(payment, 'totalAmount', 'total_amount', presentation);
  BaseMapper.mapFieldIfExists(payment, 'scholarshipDiscount', 'scholarship_discount', presentation);
  BaseMapper.mapFieldIfExists(payment, 'amountPaid', 'amount_paid', presentation);
  BaseMapper.mapFieldIfExists(payment, 'transactionNumber', 'transaction_number', presentation);
  BaseMapper.mapFieldIfExists(payment, 'concept', 'concept', presentation);
  BaseMapper.mapFieldIfExists(payment, 'observations', 'observations', presentation);

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
