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
    if (Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      this.studentId = data.studentId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'scholarshipId')) {
      this.scholarshipId = data.scholarshipId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'managementId')) {
      this.managementId = data.managementId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'requestDate')) {
      this.requestDate = data.requestDate;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'state')) {
      this.state = data.state;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.state = ESTADOS_BECAS.PENDIENTE;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'documentsComplete')) {
      this.documentsComplete = data.documentsComplete;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.documentsComplete = false;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'documentDeliveryStartDate')) {
      this.documentDeliveryStartDate = data.documentDeliveryStartDate;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'documentDeliveryEndDate')) {
      this.documentDeliveryEndDate = data.documentDeliveryEndDate;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'observations')) {
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
    if (Object.prototype.hasOwnProperty.call(this, 'studentId')) {
      plainObject.studentId = this.studentId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'scholarshipId')) {
      plainObject.scholarshipId = this.scholarshipId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'managementId')) {
      plainObject.managementId = this.managementId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'requestDate')) {
      plainObject.requestDate = this.requestDate;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'state')) {
      plainObject.state = this.state;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'documentsComplete')) {
      plainObject.documentsComplete = this.documentsComplete;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'documentDeliveryStartDate')) {
      plainObject.documentDeliveryStartDate = this.documentDeliveryStartDate;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'documentDeliveryEndDate')) {
      plainObject.documentDeliveryEndDate = this.documentDeliveryEndDate;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'observations')) {
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
