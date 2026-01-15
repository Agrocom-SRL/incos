import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_MATERIA_INSCRITA_VALUES, ESTADOS_MATERIA_INSCRITA } from '../constants/inscripciones.constants.js';

/**
 * Entidad de Dominio: EnrollmentSubject
 * Representa la inscripción de un estudiante a una asignación docente específica (materia)
 */
export class EnrollmentSubject extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('enrollmentId')) {
      this.enrollmentId = data.enrollmentId;
    }
    if (data.hasOwnProperty('teacherAssignmentId')) {
      this.teacherAssignmentId = data.teacherAssignmentId;
    }
    if (data.hasOwnProperty('finalGrade')) {
      this.finalGrade = data.finalGrade;
    }
    if (data.hasOwnProperty('definitiveGrade')) {
      this.definitiveGrade = data.definitiveGrade;
    }
    if (data.hasOwnProperty('status')) {
      this.status = data.status;
    } else if (!data.hasOwnProperty('enrollmentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.status = ESTADOS_MATERIA_INSCRITA.INSCRITO;
    }
    if (data.hasOwnProperty('observations')) {
      this.observations = data.observations;
    }
    if (data.hasOwnProperty('teacherObservations')) {
      this.teacherObservations = data.teacherObservations;
    }
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
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();
    
    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('enrollmentId')) {
      plainObject.enrollmentId = this.enrollmentId;
    }
    if (this.hasOwnProperty('teacherAssignmentId')) {
      plainObject.teacherAssignmentId = this.teacherAssignmentId;
    }
    if (this.hasOwnProperty('finalGrade')) {
      plainObject.finalGrade = this.finalGrade;
    }
    if (this.hasOwnProperty('definitiveGrade')) {
      plainObject.definitiveGrade = this.definitiveGrade;
    }
    if (this.hasOwnProperty('status')) {
      plainObject.status = this.status;
    }
    if (this.hasOwnProperty('observations')) {
      plainObject.observations = this.observations;
    }
    if (this.hasOwnProperty('teacherObservations')) {
      plainObject.teacherObservations = this.teacherObservations;
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
