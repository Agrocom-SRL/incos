import { BaseEntity } from './BaseEntity.js';
import { MOTIVOS_LICENCIAS_VALUES, ESTADOS_LICENCIAS_VALUES, ESTADOS_LICENCIAS } from '../constants/index.js';

/**
 * Entidad de Dominio: LicenseRequest
 * Representa una solicitud de licencia de un estudiante
 */
export class LicenseRequest extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('studentId')) {
      this.studentId = data.studentId;
    }
    if (data.hasOwnProperty('careerId')) {
      this.careerId = data.careerId;
    }
    if (data.hasOwnProperty('managementId')) {
      this.managementId = data.managementId;
    }
    if (data.hasOwnProperty('courseShiftId')) {
      this.courseShiftId = data.courseShiftId;
    }
    if (data.hasOwnProperty('requestDate')) {
      this.requestDate = data.requestDate;
    }
    if (data.hasOwnProperty('startDate')) {
      this.startDate = data.startDate;
    }
    if (data.hasOwnProperty('endDate')) {
      this.endDate = data.endDate;
    }
    if (data.hasOwnProperty('totalDays')) {
      this.totalDays = data.totalDays;
    }
    if (data.hasOwnProperty('reason')) {
      this.reason = data.reason; // ENFERMEDAD, TRABAJO, FAMILIAR, etc.
    }
    if (data.hasOwnProperty('reasonDetail')) {
      this.reasonDetail = data.reasonDetail;
    }
    if (data.hasOwnProperty('state')) {
      this.state = data.state;
    } else if (!data.hasOwnProperty('studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.state = ESTADOS_LICENCIAS.PENDIENTE;
    }
    if (data.hasOwnProperty('decisionDate')) {
      this.decisionDate = data.decisionDate;
    }
    if (data.hasOwnProperty('decidedBy')) {
      this.decidedBy = data.decidedBy;
    }
    if (data.hasOwnProperty('rejectionReason')) {
      this.rejectionReason = data.rejectionReason;
    }
    if (data.hasOwnProperty('documentsComplete')) {
      this.documentsComplete = data.documentsComplete;
    } else if (!data.hasOwnProperty('studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.documentsComplete = false;
    }
    if (data.hasOwnProperty('documentDeliveryStartDate')) {
      this.documentDeliveryStartDate = data.documentDeliveryStartDate;
    }
    if (data.hasOwnProperty('documentDeliveryEndDate')) {
      this.documentDeliveryEndDate = data.documentDeliveryEndDate;
    }
    if (data.hasOwnProperty('observations')) {
      this.observations = data.observations;
    }
    if (data.hasOwnProperty('decisionObservations')) {
      this.decisionObservations = data.decisionObservations;
    }
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
    return this.state === ESTADOS_LICENCIAS.APROBADA;
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();
    
    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('studentId')) {
      plainObject.studentId = this.studentId;
    }
    if (this.hasOwnProperty('careerId')) {
      plainObject.careerId = this.careerId;
    }
    if (this.hasOwnProperty('managementId')) {
      plainObject.managementId = this.managementId;
    }
    if (this.hasOwnProperty('courseShiftId')) {
      plainObject.courseShiftId = this.courseShiftId;
    }
    if (this.hasOwnProperty('requestDate')) {
      plainObject.requestDate = this.requestDate;
    }
    if (this.hasOwnProperty('startDate')) {
      plainObject.startDate = this.startDate;
    }
    if (this.hasOwnProperty('endDate')) {
      plainObject.endDate = this.endDate;
    }
    if (this.hasOwnProperty('totalDays')) {
      plainObject.totalDays = this.totalDays;
    }
    if (this.hasOwnProperty('reason')) {
      plainObject.reason = this.reason;
    }
    if (this.hasOwnProperty('reasonDetail')) {
      plainObject.reasonDetail = this.reasonDetail;
    }
    if (this.hasOwnProperty('state')) {
      plainObject.state = this.state;
    }
    if (this.hasOwnProperty('decisionDate')) {
      plainObject.decisionDate = this.decisionDate;
    }
    if (this.hasOwnProperty('decidedBy')) {
      plainObject.decidedBy = this.decidedBy;
    }
    if (this.hasOwnProperty('rejectionReason')) {
      plainObject.rejectionReason = this.rejectionReason;
    }
    if (this.hasOwnProperty('documentsComplete')) {
      plainObject.documentsComplete = this.documentsComplete;
    }
    if (this.hasOwnProperty('documentDeliveryStartDate')) {
      plainObject.documentDeliveryStartDate = this.documentDeliveryStartDate;
    }
    if (this.hasOwnProperty('documentDeliveryEndDate')) {
      plainObject.documentDeliveryEndDate = this.documentDeliveryEndDate;
    }
    if (this.hasOwnProperty('observations')) {
      plainObject.observations = this.observations;
    }
    if (this.hasOwnProperty('decisionObservations')) {
      plainObject.decisionObservations = this.decisionObservations;
    }

    return plainObject;
  }

  /**
   * Convierte la entidad a JSON
   * Usa toPlainObject() para serialización
   * @returns {Object}
   */
  toJSON() {
    return this.toPlainObject();
  }
}
