import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_MATERIA_INSCRITA_VALUES, ESTADOS_MATERIA_INSCRITA } from '../constants/inscripciones.constants.js';

/**
 * Entidad de Dominio: EnrollmentSubject
 * Representa la inscripción de un estudiante a una asignación docente específica (materia)
 */
export class EnrollmentSubject extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.enrollmentId = data.enrollmentId || null;
    this.teacherAssignmentId = data.teacherAssignmentId || null;
    this.finalGrade = data.finalGrade || null;
    this.definitiveGrade = data.definitiveGrade || null;
    this.status = data.status || ESTADOS_MATERIA_INSCRITA.INSCRITO;
    this.observations = data.observations || null;
    this.teacherObservations = data.teacherObservations || null;
  }

  /**
   * Valida el estado de la materia inscrita
   * @returns {boolean}
   */
  isValidStatus() {
    if (!this.status) return false;
    return ESTADOS_MATERIA_INSCRITA_VALUES.includes(this.status);
  }

  /**
   * Verifica si la materia está inscrita
   * @returns {boolean}
   */
  isEnrolled() {
    return this.status === ESTADOS_MATERIA_INSCRITA.INSCRITO;
  }

  /**
   * Verifica si la materia está en curso
   * @returns {boolean}
   */
  isInProgress() {
    return this.status === ESTADOS_MATERIA_INSCRITA.CURSANDO;
  }

  /**
   * Verifica si la materia está aprobada
   * @returns {boolean}
   */
  isApproved() {
    return this.status === ESTADOS_MATERIA_INSCRITA.APROBADO;
  }

  /**
   * Verifica si la materia está reprobada
   * @returns {boolean}
   */
  isFailed() {
    return this.status === ESTADOS_MATERIA_INSCRITA.REPROBADO;
  }

  /**
   * Verifica si la materia fue abandonada
   * @returns {boolean}
   */
  isAbandoned() {
    return this.status === ESTADOS_MATERIA_INSCRITA.ABANDONO;
  }

  /**
   * Verifica si la materia fue retirada
   * @returns {boolean}
   */
  isWithdrawn() {
    return this.status === ESTADOS_MATERIA_INSCRITA.RETIRADO;
  }

  /**
   * Valida la nota final (0-100)
   * @returns {boolean}
   */
  isValidFinalGrade() {
    if (this.finalGrade === null || this.finalGrade === undefined) return true; // Opcional
    return this.finalGrade >= 0 && this.finalGrade <= 100;
  }

  /**
   * Valida la nota definitiva (0-100)
   * @returns {boolean}
   */
  isValidDefinitiveGrade() {
    if (this.definitiveGrade === null || this.definitiveGrade === undefined) return true; // Opcional
    return this.definitiveGrade >= 0 && this.definitiveGrade <= 100;
  }

  /**
   * Verifica si la materia está aprobada según la nota definitiva
   * @returns {boolean}
   */
  isApprovedByGrade() {
    if (!this.definitiveGrade) return false;
    return this.definitiveGrade >= 60;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      enrollmentId: this.enrollmentId,
      teacherAssignmentId: this.teacherAssignmentId,
      finalGrade: this.finalGrade,
      definitiveGrade: this.definitiveGrade,
      status: this.status,
      observations: this.observations,
      teacherObservations: this.teacherObservations,
    };
  }
}
