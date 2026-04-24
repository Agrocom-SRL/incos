import { BaseEntity } from './BaseEntity.js';
import { NIVELES_ACADEMICOS_PERSONAL_VALUES, TIPOS_DIRECTOR_VALUES, TIPOS_DIRECTOR } from '../constants/index.js';

/**
 * Entidad de Dominio: Director
 * Representa un director del instituto.
 * Contiene la lógica de negocio pura del cargo (tipo académico/administrativo).
 *
 * Mapeo con BD (tabla directores, 22-personal-usuarios.sql):
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
    if (data.hasOwnProperty('staffId')) {
      this.staffId = data.staffId;
    }
    if (data.hasOwnProperty('type')) {
      this.type = data.type; // ACADEMICO, ADMINISTRATIVO
    }
    if (data.hasOwnProperty('appointmentDate')) {
      this.appointmentDate = data.appointmentDate;
    }
    if (data.hasOwnProperty('appointmentResolution')) {
      this.appointmentResolution = data.appointmentResolution;
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
    if (this.hasOwnProperty('staffId')) {
      plainObject.staffId = this.staffId;
    }
    if (this.hasOwnProperty('type')) {
      plainObject.type = this.type;
    }
    if (this.hasOwnProperty('appointmentDate')) {
      plainObject.appointmentDate = this.appointmentDate;
    }
    if (this.hasOwnProperty('appointmentResolution')) {
      plainObject.appointmentResolution = this.appointmentResolution;
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
