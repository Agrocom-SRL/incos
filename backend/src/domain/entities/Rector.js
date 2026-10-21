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
    if (Object.prototype.hasOwnProperty.call(data, 'staffId')) {
      this.staffId = data.staffId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'professionalTitle')) {
      this.professionalTitle = data.professionalTitle;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'specialty')) {
      this.specialty = data.specialty;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'academicLevel')) {
      this.academicLevel = data.academicLevel;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'graduationInstitution')) {
      this.graduationInstitution = data.graduationInstitution;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'graduationYear')) {
      this.graduationYear = data.graduationYear;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'appointmentDate')) {
      this.appointmentDate = data.appointmentDate;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'appointmentResolution')) {
      this.appointmentResolution = data.appointmentResolution;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'mandateStartDate')) {
      this.mandateStartDate = data.mandateStartDate;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'mandateEndDate')) {
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
    if (Object.prototype.hasOwnProperty.call(this, 'staffId')) {
      plainObject.staffId = this.staffId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'professionalTitle')) {
      plainObject.professionalTitle = this.professionalTitle;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'specialty')) {
      plainObject.specialty = this.specialty;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'academicLevel')) {
      plainObject.academicLevel = this.academicLevel;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'graduationInstitution')) {
      plainObject.graduationInstitution = this.graduationInstitution;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'graduationYear')) {
      plainObject.graduationYear = this.graduationYear;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'appointmentDate')) {
      plainObject.appointmentDate = this.appointmentDate;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'appointmentResolution')) {
      plainObject.appointmentResolution = this.appointmentResolution;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'mandateStartDate')) {
      plainObject.mandateStartDate = this.mandateStartDate;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'mandateEndDate')) {
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
