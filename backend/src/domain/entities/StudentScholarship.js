import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_BECAS_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: StudentScholarship
 * Representa una beca asignada a un estudiante
 */
export class StudentScholarship extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.studentId = data.studentId || null;
    this.scholarshipId = data.scholarshipId || null;
    this.managementId = data.managementId || null;
    this.requestDate = data.requestDate || null;
    this.state = data.state || 'PENDIENTE'; // PENDIENTE, ACTIVA, FINALIZADA, RECHAZADA
    this.documentsComplete = data.documentsComplete !== undefined ? data.documentsComplete : false;
    this.documentDeliveryStartDate = data.documentDeliveryStartDate || null;
    this.documentDeliveryEndDate = data.documentDeliveryEndDate || null;
    this.observations = data.observations || null;
  }

  /**
   * Valida el estado de la beca
   * @returns {boolean}
   */
  isValidState() {
    if (!this.state) return false;
    return ESTADOS_BECAS_VALUES.includes(this.state);
  }

  /**
   * Verifica si la beca está activa
   * @returns {boolean}
   */
  isActive() {
    return this.state === 'ACTIVA';
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      studentId: this.studentId,
      scholarshipId: this.scholarshipId,
      managementId: this.managementId,
      requestDate: this.requestDate,
      state: this.state,
      documentsComplete: this.documentsComplete,
      documentDeliveryStartDate: this.documentDeliveryStartDate,
      documentDeliveryEndDate: this.documentDeliveryEndDate,
      observations: this.observations,
    };
  }
}
