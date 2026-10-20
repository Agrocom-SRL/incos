import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_ACADEMICOS_VALUES, ESTADOS_ACADEMICOS, ESTADOS_REGISTRO_ESTUDIANTE_VALUES, ESTADOS_REGISTRO_ESTUDIANTE, TIPOS_ADMISION } from '../constants/index.js';

/**
 * Entidad de Dominio: StudentAcademicData
 * Representa los datos académicos de un estudiante
 */
export class StudentAcademicData extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      this.studentId = data.studentId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'careerId')) {
      this.careerId = data.careerId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'managementId')) {
      this.managementId = data.managementId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'academicState')) {
      this.academicState = data.academicState;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.academicState = ESTADOS_ACADEMICOS.REGULAR;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'registrationState')) {
      this.registrationState = data.registrationState;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.registrationState = ESTADOS_REGISTRO_ESTUDIANTE.BORRADOR;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'admissionType')) {
      this.admissionType = data.admissionType;
    } else if (Object.prototype.hasOwnProperty.call(data, 'tipoAdmision')) {
      this.admissionType = data.tipoAdmision;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      this.admissionType = TIPOS_ADMISION.NUEVO;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'annualAverage')) {
      this.annualAverage = data.annualAverage;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'photoUrl')) {
      this.photoUrl = data.photoUrl;
    }
  }

  /**
   * Valida el estado de registro
   * @returns {boolean}
   */
  isValidRegistrationState() {
    if (!this.registrationState) return false;
    return ESTADOS_REGISTRO_ESTUDIANTE_VALUES.includes(this.registrationState);
  }

  /**
   * Valida el estado académico
   * @returns {boolean}
   */
  isValidAcademicState() {
    if (!this.academicState) return false;
    return ESTADOS_ACADEMICOS_VALUES.includes(this.academicState);
  }

  /**
   * Verifica si el estudiante está regular
   * @returns {boolean}
   */
  isRegular() {
    return this.academicState === ESTADOS_ACADEMICOS.REGULAR;
  }

  /**
   * Verifica si el estudiante se retiró
   * @returns {boolean}
   */
  isWithdrawn() {
    return this.academicState === ESTADOS_ACADEMICOS.RETIRADO || this.academicState === ESTADOS_ACADEMICOS.ABANDONO;
  }

  /**
   * Valida el promedio anual (0-100)
   * @returns {boolean}
   */
  isValidAnnualAverage() {
    if (this.annualAverage === null || this.annualAverage === undefined) return true; // Opcional
    return this.annualAverage >= 0 && this.annualAverage <= 100;
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
    if (Object.prototype.hasOwnProperty.call(this, 'careerId')) {
      plainObject.careerId = this.careerId;
      plainObject.carreraId = this.careerId; // API: frontend espera carreraId
    }
    if (Object.prototype.hasOwnProperty.call(this, 'managementId')) {
      plainObject.managementId = this.managementId;
      plainObject.gestionIngresoId = this.managementId; // API: frontend espera gestionIngresoId
    }
    if (Object.prototype.hasOwnProperty.call(this, 'academicState')) {
      plainObject.academicState = this.academicState;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'registrationState')) {
      plainObject.registrationState = this.registrationState;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'admissionType')) {
      plainObject.admissionType = this.admissionType;
      plainObject.tipoAdmision = this.admissionType; // API: frontend espera tipoAdmision
    }
    if (Object.prototype.hasOwnProperty.call(this, 'annualAverage')) {
      plainObject.annualAverage = this.annualAverage;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'photoUrl')) {
      plainObject.photoUrl = this.photoUrl;
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
