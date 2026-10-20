import { BaseEntity } from './BaseEntity.js';
import { NIVELES_ACADEMICOS_PERSONAL_VALUES, TIPOS_DIRECTOR_VALUES, TIPOS_DIRECTOR } from '../constants/index.js';

/**
 * Entidad de Dominio: Director
 * Representa un director del instituto.
 * Contiene la lógica de negocio pura del cargo (tipo académico/administrativo).
 *
 * Mapeo con BD (tabla directores, 23-personal-usuarios.sql):
 * - staffId ← personal_id; type ← tipo; appointmentDate ← fecha_nombramiento;
 *   appointmentResolution ← resolucion_nombramiento; professionalTitle ← titulo_profesional;
 *   specialty ← especialidad; academicLevel ← nivel_academico;
 *   graduationInstitution ← institucion_egreso; graduationYear ← anio_egreso
 */
export class Director extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'staffId')) {
      this.staffId = data.staffId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'type')) {
      this.type = data.type; // ACADEMICO, ADMINISTRATIVO
    }
    if (Object.prototype.hasOwnProperty.call(data, 'appointmentDate')) {
      this.appointmentDate = data.appointmentDate;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'appointmentResolution')) {
      this.appointmentResolution = data.appointmentResolution;
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
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (Object.prototype.hasOwnProperty.call(this, 'staffId')) {
      plainObject.staffId = this.staffId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'type')) {
      plainObject.type = this.type;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'appointmentDate')) {
      plainObject.appointmentDate = this.appointmentDate;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'appointmentResolution')) {
      plainObject.appointmentResolution = this.appointmentResolution;
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
