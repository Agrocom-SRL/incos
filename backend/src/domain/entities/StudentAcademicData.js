import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_ACADEMICOS_VALUES, ESTADOS_ACADEMICOS, ESTADOS_REGISTRO_ESTUDIANTE_VALUES, ESTADOS_REGISTRO_ESTUDIANTE } from '../constants/index.js';

/**
 * Entidad de Dominio: StudentAcademicData
 * Representa los datos académicos de un estudiante
 */
export class StudentAcademicData extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.studentId = data.studentId || null;
    this.careerId = data.careerId || null;
    this.managementId = data.managementId || null;
    this.academicState = data.academicState || ESTADOS_ACADEMICOS.REGULAR;
    this.registrationState = data.registrationState || ESTADOS_REGISTRO_ESTUDIANTE.BORRADOR;
    this.previousSchool = data.previousSchool || null;
    this.highSchoolGraduationYear = data.highSchoolGraduationYear || null;
    this.annualAverage = data.annualAverage || null;
    this.graduationDate = data.graduationDate || null;
    this.withdrawalDate = data.withdrawalDate || null;
    this.withdrawalReason = data.withdrawalReason || null;
    this.photoUrl = data.photoUrl || null;
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
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      studentId: this.studentId,
      careerId: this.careerId,
      managementId: this.managementId,
      academicState: this.academicState,
      registrationState: this.registrationState,
      previousSchool: this.previousSchool,
      highSchoolGraduationYear: this.highSchoolGraduationYear,
      annualAverage: this.annualAverage,
      graduationDate: this.graduationDate,
      withdrawalDate: this.withdrawalDate,
      withdrawalReason: this.withdrawalReason,
      photoUrl: this.photoUrl,
    };
  }
}
