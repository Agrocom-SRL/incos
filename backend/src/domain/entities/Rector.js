import { BaseEntity } from './BaseEntity.js';
import { NIVELES_ACADEMICOS_PERSONAL_VALUES } from '../../shared/constants/index.js';

/**
 * Entidad de Dominio: Rector
 * Representa un rector del instituto
 */
export class Rector extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.staffId = data.staffId || null;
    this.professionalTitle = data.professionalTitle || null;
    this.specialty = data.specialty || null;
    this.academicLevel = data.academicLevel || null;
    this.graduationInstitution = data.graduationInstitution || null;
    this.graduationYear = data.graduationYear || null;
    this.appointmentDate = data.appointmentDate || null;
    this.appointmentResolution = data.appointmentResolution || null;
    this.mandateStartDate = data.mandateStartDate || null;
    this.mandateEndDate = data.mandateEndDate || null;
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
   * Verifica si el rector está en mandato activo
   * @returns {boolean}
   */
  isInActiveMandate() {
    if (!this.mandateStartDate) return false;
    const today = new Date();
    const start = new Date(this.mandateStartDate);
    if (today < start) return false;
    if (this.mandateEndDate) {
      const end = new Date(this.mandateEndDate);
      return today <= end;
    }
    return true; // Sin fecha de fin = mandato indefinido
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      staffId: this.staffId,
      professionalTitle: this.professionalTitle,
      specialty: this.specialty,
      academicLevel: this.academicLevel,
      graduationInstitution: this.graduationInstitution,
      graduationYear: this.graduationYear,
      appointmentDate: this.appointmentDate,
      appointmentResolution: this.appointmentResolution,
      mandateStartDate: this.mandateStartDate,
      mandateEndDate: this.mandateEndDate,
    };
  }
}
