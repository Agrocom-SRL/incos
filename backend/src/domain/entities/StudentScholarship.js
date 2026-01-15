import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_BECAS_VALUES, ESTADOS_BECAS } from '../constants/index.js';

/**
 * Entidad de Dominio: StudentScholarship
 * Representa una beca asignada a un estudiante
 */
export class StudentScholarship extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('studentId')) {
      this.studentId = data.studentId;
    }
    if (data.hasOwnProperty('scholarshipId')) {
      this.scholarshipId = data.scholarshipId;
    }
    if (data.hasOwnProperty('managementId')) {
      this.managementId = data.managementId;
    }
    if (data.hasOwnProperty('requestDate')) {
      this.requestDate = data.requestDate;
    }
    if (data.hasOwnProperty('state')) {
      this.state = data.state;
    } else if (!data.hasOwnProperty('studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.state = ESTADOS_BECAS.PENDIENTE;
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
    return this.state === ESTADOS_BECAS.ACTIVA;
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
    if (this.hasOwnProperty('scholarshipId')) {
      plainObject.scholarshipId = this.scholarshipId;
    }
    if (this.hasOwnProperty('managementId')) {
      plainObject.managementId = this.managementId;
    }
    if (this.hasOwnProperty('requestDate')) {
      plainObject.requestDate = this.requestDate;
    }
    if (this.hasOwnProperty('state')) {
      plainObject.state = this.state;
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
