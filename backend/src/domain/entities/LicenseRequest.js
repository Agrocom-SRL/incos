import { BaseEntity } from './BaseEntity.js';
import { MOTIVOS_LICENCIAS_VALUES, ESTADOS_LICENCIAS_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: LicenseRequest
 * Representa una solicitud de licencia de un estudiante
 */
export class LicenseRequest extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.studentId = data.studentId || null;
    this.careerId = data.careerId || null;
    this.managementId = data.managementId || null;
    this.courseShiftId = data.courseShiftId || null;
    this.requestDate = data.requestDate || null;
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.totalDays = data.totalDays !== undefined ? data.totalDays : null;
    this.reason = data.reason || null; // ENFERMEDAD, TRABAJO, FAMILIAR, etc.
    this.reasonDetail = data.reasonDetail || null;
    this.state = data.state || 'PENDIENTE'; // PENDIENTE, APROBADA, RECHAZADA, CANCELADA
    this.decisionDate = data.decisionDate || null;
    this.decidedBy = data.decidedBy || null;
    this.rejectionReason = data.rejectionReason || null;
    this.documentsComplete = data.documentsComplete !== undefined ? data.documentsComplete : false;
    this.documentDeliveryStartDate = data.documentDeliveryStartDate || null;
    this.documentDeliveryEndDate = data.documentDeliveryEndDate || null;
    this.observations = data.observations || null;
    this.decisionObservations = data.decisionObservations || null;
  }

  /**
   * Valida el motivo de la licencia
   * @returns {boolean}
   */
  isValidReason() {
    if (!this.reason) return false;
    return MOTIVOS_LICENCIAS_VALUES.includes(this.reason);
  }

  /**
   * Valida el estado de la solicitud
   * @returns {boolean}
   */
  isValidState() {
    if (!this.state) return false;
    return ESTADOS_LICENCIAS_VALUES.includes(this.state);
  }

  /**
   * Valida que la fecha de fin sea mayor que la de inicio
   * @returns {boolean}
   */
  isValidDateRange() {
    if (!this.startDate || !this.endDate) return false;
    return new Date(this.endDate) >= new Date(this.startDate);
  }

  /**
   * Calcula el total de días entre las fechas
   * @returns {number}
   */
  calculateTotalDays() {
    if (!this.startDate || !this.endDate) return 0;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
    return diffDays;
  }

  /**
   * Verifica si la solicitud está aprobada
   * @returns {boolean}
   */
  isApproved() {
    return this.state === 'APROBADA';
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      studentId: this.studentId,
      careerId: this.careerId,
      managementId: this.managementId,
      courseShiftId: this.courseShiftId,
      requestDate: this.requestDate,
      startDate: this.startDate,
      endDate: this.endDate,
      totalDays: this.totalDays,
      reason: this.reason,
      reasonDetail: this.reasonDetail,
      state: this.state,
      decisionDate: this.decisionDate,
      decidedBy: this.decidedBy,
      rejectionReason: this.rejectionReason,
      documentsComplete: this.documentsComplete,
      documentDeliveryStartDate: this.documentDeliveryStartDate,
      documentDeliveryEndDate: this.documentDeliveryEndDate,
      observations: this.observations,
      decisionObservations: this.decisionObservations,
    };
  }
}
