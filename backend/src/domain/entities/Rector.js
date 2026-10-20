import { BaseEntity } from './BaseEntity.js';
import { NIVELES_ACADEMICOS_PERSONAL_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: Rector
 * Representa un rector del instituto.
 * Contiene la lógica de negocio pura del cargo (mandato, nombramiento).
 *
 * Mapeo con BD (tabla rectores, 23-personal-usuarios.sql):
 * - staffId ← personal_id; professionalTitle ← titulo_profesional; specialty ← especialidad;
 *   academicLevel ← nivel_academico; graduationInstitution ← institucion_egreso;
 *   graduationYear ← anio_egreso; appointmentDate ← fecha_nombramiento;
 *   appointmentResolution ← resolucion_nombramiento; mandateStartDate ← periodo_mandato_inicio;
 *   mandateEndDate ← periodo_mandato_fin
 */
export class Rector extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('staffId')) {
      this.staffId = data.staffId;
    }
    if (data.hasOwnProperty('professionalTitle')) {
      this.professionalTitle = data.professionalTitle;
    }
    if (data.hasOwnProperty('specialty')) {
      this.specialty = data.specialty;
    }
    if (data.hasOwnProperty('academicLevel')) {
      this.academicLevel = data.academicLevel;
    }
    if (data.hasOwnProperty('graduationInstitution')) {
      this.graduationInstitution = data.graduationInstitution;
    }
    if (data.hasOwnProperty('graduationYear')) {
      this.graduationYear = data.graduationYear;
    }
    if (data.hasOwnProperty('appointmentDate')) {
      this.appointmentDate = data.appointmentDate;
    }
    if (data.hasOwnProperty('appointmentResolution')) {
      this.appointmentResolution = data.appointmentResolution;
    }
    if (data.hasOwnProperty('mandateStartDate')) {
      this.mandateStartDate = data.mandateStartDate;
    }
    if (data.hasOwnProperty('mandateEndDate')) {
      this.mandateEndDate = data.mandateEndDate;
    }
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
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('staffId')) {
      plainObject.staffId = this.staffId;
    }
    if (this.hasOwnProperty('professionalTitle')) {
      plainObject.professionalTitle = this.professionalTitle;
    }
    if (this.hasOwnProperty('specialty')) {
      plainObject.specialty = this.specialty;
    }
    if (this.hasOwnProperty('academicLevel')) {
      plainObject.academicLevel = this.academicLevel;
    }
    if (this.hasOwnProperty('graduationInstitution')) {
      plainObject.graduationInstitution = this.graduationInstitution;
    }
    if (this.hasOwnProperty('graduationYear')) {
      plainObject.graduationYear = this.graduationYear;
    }
    if (this.hasOwnProperty('appointmentDate')) {
      plainObject.appointmentDate = this.appointmentDate;
    }
    if (this.hasOwnProperty('appointmentResolution')) {
      plainObject.appointmentResolution = this.appointmentResolution;
    }
    if (this.hasOwnProperty('mandateStartDate')) {
      plainObject.mandateStartDate = this.mandateStartDate;
    }
    if (this.hasOwnProperty('mandateEndDate')) {
      plainObject.mandateEndDate = this.mandateEndDate;
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
