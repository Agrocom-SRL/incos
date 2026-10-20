import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_ACADEMICOS_VALUES, ESTADOS_ACADEMICOS, ESTADOS_REGISTRO_ESTUDIANTE_VALUES, ESTADOS_REGISTRO_ESTUDIANTE, TIPOS_ADMISION_VALUES, TIPOS_ADMISION } from '../constants/index.js';

/**
 * Entidad de Dominio: StudentAcademicData
 * Representa los datos académicos de un estudiante
 */
export class StudentAcademicData extends BaseEntity {
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
    if (data.hasOwnProperty('academicState')) {
      this.academicState = data.academicState;
    } else if (!data.hasOwnProperty('studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.academicState = ESTADOS_ACADEMICOS.REGULAR;
    }
    if (data.hasOwnProperty('registrationState')) {
      this.registrationState = data.registrationState;
    } else if (!data.hasOwnProperty('studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.registrationState = ESTADOS_REGISTRO_ESTUDIANTE.BORRADOR;
    }
    if (data.hasOwnProperty('admissionType')) {
      this.admissionType = data.admissionType;
    } else if (data.hasOwnProperty('tipoAdmision')) {
      this.admissionType = data.tipoAdmision;
    } else if (!data.hasOwnProperty('studentId')) {
      this.admissionType = TIPOS_ADMISION.NUEVO;
    }
    if (data.hasOwnProperty('annualAverage')) {
      this.annualAverage = data.annualAverage;
    }
    if (data.hasOwnProperty('photoUrl')) {
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
    if (this.hasOwnProperty('studentId')) {
      plainObject.studentId = this.studentId;
    }
    if (this.hasOwnProperty('careerId')) {
      plainObject.careerId = this.careerId;
      plainObject.carreraId = this.careerId; // API: frontend espera carreraId
    }
    if (this.hasOwnProperty('managementId')) {
      plainObject.managementId = this.managementId;
      plainObject.gestionIngresoId = this.managementId; // API: frontend espera gestionIngresoId
    }
    if (this.hasOwnProperty('academicState')) {
      plainObject.academicState = this.academicState;
    }
    if (this.hasOwnProperty('registrationState')) {
      plainObject.registrationState = this.registrationState;
    }
    if (this.hasOwnProperty('admissionType')) {
      plainObject.admissionType = this.admissionType;
      plainObject.tipoAdmision = this.admissionType; // API: frontend espera tipoAdmision
    }
    if (this.hasOwnProperty('annualAverage')) {
      plainObject.annualAverage = this.annualAverage;
    }
    if (this.hasOwnProperty('photoUrl')) {
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
