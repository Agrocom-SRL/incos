import { BaseEntity } from './BaseEntity.js';
import { TIPOS_INSCRIPCION_VALUES, TIPOS_INSCRIPCION } from '../constants/inscripciones.constants.js';

/**
 * Entidad de Dominio: Enrollment
 * Representa la inscripción de un estudiante a una gestión académica
 */
export class Enrollment extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.studentAcademicDataId = data.studentAcademicDataId || null;
    this.managementId = data.managementId || null;
    this.enrollmentType = data.enrollmentType || TIPOS_INSCRIPCION.CONTINUIDAD;
    this.enrollmentDate = data.enrollmentDate || null;
    this.observations = data.observations || null;
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
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      studentAcademicDataId: this.studentAcademicDataId,
      managementId: this.managementId,
      enrollmentType: this.enrollmentType,
      enrollmentDate: this.enrollmentDate,
      observations: this.observations,
    };
  }
}
