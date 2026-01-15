import { BaseEntity } from './BaseEntity.js';
import { TIPOS_INSCRIPCION_VALUES, TIPOS_INSCRIPCION } from '../constants/inscripciones.constants.js';

/**
 * Entidad de Dominio: Enrollment
 * Representa la inscripción de un estudiante a una gestión académica
 */
export class Enrollment extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('studentAcademicDataId')) {
      this.studentAcademicDataId = data.studentAcademicDataId;
    }
    if (data.hasOwnProperty('managementId')) {
      this.managementId = data.managementId;
    }
    if (data.hasOwnProperty('enrollmentType')) {
      this.enrollmentType = data.enrollmentType;
    } else if (!data.hasOwnProperty('studentAcademicDataId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      // (si no tiene studentAcademicDataId, asumimos que es una entidad completa)
      this.enrollmentType = TIPOS_INSCRIPCION.NUEVO;
    }
    if (data.hasOwnProperty('enrollmentDate')) {
      this.enrollmentDate = data.enrollmentDate;
    }
    if (data.hasOwnProperty('observations')) {
      this.observations = data.observations;
    }
  }

  /**
   * Valida el tipo de inscripción
   * @returns {boolean}
   */
  isValidEnrollmentType() {
    if (!this.enrollmentType) return false;
    return TIPOS_INSCRIPCION_VALUES.includes(this.enrollmentType);
  }

  /**
   * Verifica si es una inscripción de estudiante nuevo
   * @returns {boolean}
   */
  isNewStudent() {
    return this.enrollmentType === TIPOS_INSCRIPCION.NUEVO;
  }

  /**
   * Verifica si es una inscripción de continuidad
   * @returns {boolean}
   */
  isContinuity() {
    return this.enrollmentType === TIPOS_INSCRIPCION.CONTINUIDAD;
  }

  /**
   * Verifica si es una inscripción de reingreso
   * @returns {boolean}
   */
  isReentry() {
    return this.enrollmentType === TIPOS_INSCRIPCION.REINGRESO;
  }

  /**
   * Verifica si es una transferencia de entrada
   * @returns {boolean}
   */
  isTransferIn() {
    return this.enrollmentType === TIPOS_INSCRIPCION.TRANSFERENCIA_ENTRADA;
  }

  /**
   * Verifica si es un traspaso de entrada
   * @returns {boolean}
   */
  isTransferBetweenCampuses() {
    return this.enrollmentType === TIPOS_INSCRIPCION.TRASPASO_ENTRADA;
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();
    
    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('studentAcademicDataId')) {
      plainObject.studentAcademicDataId = this.studentAcademicDataId;
    }
    if (this.hasOwnProperty('managementId')) {
      plainObject.managementId = this.managementId;
    }
    if (this.hasOwnProperty('enrollmentType')) {
      plainObject.enrollmentType = this.enrollmentType;
    }
    if (this.hasOwnProperty('enrollmentDate')) {
      plainObject.enrollmentDate = this.enrollmentDate;
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
