import { BaseEntity } from './BaseEntity.js';
import { NIVELES_ACADEMICOS_PERSONAL_VALUES, TIPOS_DIRECTOR_VALUES, TIPOS_DIRECTOR } from '../constants/index.js';

/**
 * Entidad de Dominio: Director
 * Representa un director del instituto
 */
export class Director extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.staffId = data.staffId || null;
    this.type = data.type || null; // ACADEMICO, ADMINISTRATIVO
    this.appointmentDate = data.appointmentDate || null;
    this.appointmentResolution = data.appointmentResolution || null;
    this.professionalTitle = data.professionalTitle || null;
    this.specialty = data.specialty || null;
    this.academicLevel = data.academicLevel || null;
    this.graduationInstitution = data.graduationInstitution || null;
    this.graduationYear = data.graduationYear || null;
  }

  /**
   * Valida el tipo de director
   * @returns {boolean}
   */
  isValidType() {
    if (!this.type) return false;
    return TIPOS_DIRECTOR_VALUES.includes(this.type);
  }

  /**
   * Valida el nivel académico
   * @returns {boolean}
   */
  isValidAcademicLevel() {
    if (!this.academicLevel) return true; // Opcional
    return NIVELES_ACADEMICOS_PERSONAL_VALUES.includes(this.academicLevel);
  }

  /**
   * Verifica si es director académico
   * @returns {boolean}
   */
  isAcademic() {
    return this.type === TIPOS_DIRECTOR.ACADEMICO;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      staffId: this.staffId,
      type: this.type,
      appointmentDate: this.appointmentDate,
      appointmentResolution: this.appointmentResolution,
      professionalTitle: this.professionalTitle,
      specialty: this.specialty,
      academicLevel: this.academicLevel,
      graduationInstitution: this.graduationInstitution,
      graduationYear: this.graduationYear,
    };
  }
}
