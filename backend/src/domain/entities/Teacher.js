import { BaseEntity } from './BaseEntity.js';
import { EXPEDICIONES_CI_VALUES, GENEROS_VALUES } from '../constants/index.js';
import { NIVELES_ACADEMICOS_PERSONAL_VALUES, NIVELES_ACADEMICOS, TIPOS_CONTRATO_DOCENTE_VALUES, TIPOS_CONTRATO_DOCENTE, ESTADOS_LABORALES_VALUES, ESTADOS_LABORALES, DOCENTE_COLOR_HEX_REGEX } from '../constants/docentes.constants.js';

/**
 * Entidad de Dominio: Teacher
 * Representa un docente del instituto
 */
export class Teacher extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('userId')) {
      this.userId = data.userId;
    }
    if (data.hasOwnProperty('ci')) {
      this.ci = data.ci;
    }
    if (data.hasOwnProperty('expedition')) {
      this.expedition = data.expedition;
    }
    if (data.hasOwnProperty('firstName')) {
      this.firstName = data.firstName;
    }
    if (data.hasOwnProperty('lastName')) {
      this.lastName = data.lastName;
    }
    if (data.hasOwnProperty('motherLastName')) {
      this.motherLastName = data.motherLastName;
    }
    if (data.hasOwnProperty('birthDate')) {
      this.birthDate = data.birthDate;
    }
    if (data.hasOwnProperty('gender')) {
      this.gender = data.gender;
    }
    if (data.hasOwnProperty('civilStatusId')) {
      this.civilStatusId = data.civilStatusId;
    }
    if (data.hasOwnProperty('nationality')) {
      this.nationality = data.nationality;
    } else if (!data.hasOwnProperty('userId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.nationality = 'Boliviana';
    }
    if (data.hasOwnProperty('phone')) {
      this.phone = data.phone;
    }
    if (data.hasOwnProperty('mobilePhone')) {
      this.mobilePhone = data.mobilePhone;
    }
    if (data.hasOwnProperty('personalEmail')) {
      this.personalEmail = data.personalEmail;
    }
    if (data.hasOwnProperty('address')) {
      this.address = data.address;
    }
    if (data.hasOwnProperty('residenceMunicipalityId')) {
      this.residenceMunicipalityId = data.residenceMunicipalityId;
    }
    if (data.hasOwnProperty('zone')) {
      this.zone = data.zone;
    }
    if (data.hasOwnProperty('professionalTitle')) {
      this.professionalTitle = data.professionalTitle;
    }
    if (data.hasOwnProperty('specialty')) {
      this.specialty = data.specialty;
    }
    if (data.hasOwnProperty('academicLevel')) {
      this.academicLevel = data.academicLevel;
    } else if (!data.hasOwnProperty('userId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.academicLevel = NIVELES_ACADEMICOS.LICENCIATURA;
    }
    if (data.hasOwnProperty('graduationInstitution')) {
      this.graduationInstitution = data.graduationInstitution;
    }
    if (data.hasOwnProperty('graduationYear')) {
      this.graduationYear = data.graduationYear;
    }
    if (data.hasOwnProperty('yearsOfExperience')) {
      this.yearsOfExperience = data.yearsOfExperience;
    } else if (!data.hasOwnProperty('userId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.yearsOfExperience = 0;
    }
    if (data.hasOwnProperty('hireDate')) {
      this.hireDate = data.hireDate;
    }
    if (data.hasOwnProperty('retirementDate')) {
      this.retirementDate = data.retirementDate;
    }
    if (data.hasOwnProperty('contractType')) {
      this.contractType = data.contractType;
    } else if (!data.hasOwnProperty('userId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.contractType = TIPOS_CONTRATO_DOCENTE.CONTRATO;
    }
    if (data.hasOwnProperty('laborState')) {
      this.laborState = data.laborState;
    } else if (!data.hasOwnProperty('userId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.laborState = ESTADOS_LABORALES.ACTIVO;
    }
    if (data.hasOwnProperty('observations')) {
      this.observations = data.observations;
    }
    if (data.hasOwnProperty('colorHex')) {
      this.colorHex = data.colorHex;
    }
    if (data.hasOwnProperty('maxHorasSemana')) {
      this.maxHorasSemana = data.maxHorasSemana;
    }
    if (data.hasOwnProperty('maxHorasMes')) {
      this.maxHorasMes = data.maxHorasMes;
    }
  }

  /**
   * Valida el género
   * @returns {boolean}
   */
  isValidGender() {
    if (!this.gender) return false;
    return GENEROS_VALUES.includes(this.gender);
  }

  /**
   * Obtiene el nombre completo del docente
   * @returns {string}
   */
  getFullName() {
    const parts = [this.firstName, this.lastName];
    if (this.motherLastName) {
      parts.push(this.motherLastName);
    }
    return parts.filter(Boolean).join(' ');
  }

  /**
   * Valida el formato del CI
   * @returns {boolean}
   */
  isValidCI() {
    if (!this.ci) return false;
    return /^\d{7,9}$/.test(this.ci);
  }

  /**
   * Valida el formato de la expedición
   * @returns {boolean}
   */
  isValidExpedition() {
    if (!this.expedition) return false;
    return EXPEDICIONES_CI_VALUES.includes(this.expedition);
  }

  /**
   * Valida el nivel académico
   * @returns {boolean}
   */
  isValidAcademicLevel() {
    if (!this.academicLevel) return false;
    return NIVELES_ACADEMICOS_PERSONAL_VALUES.includes(this.academicLevel);
  }

  /**
   * Valida el tipo de contrato
   * @returns {boolean}
   */
  isValidContractType() {
    if (!this.contractType) return false;
    return TIPOS_CONTRATO_DOCENTE_VALUES.includes(this.contractType);
  }

  /**
   * Valida el estado laboral
   * @returns {boolean}
   */
  isValidLaborState() {
    if (!this.laborState) return false;
    return ESTADOS_LABORALES_VALUES.includes(this.laborState);
  }

  /**
   * Valida formato #RRGGBB del color de horario.
   * @returns {boolean}
   */
  isValidColorHex() {
    if (this.colorHex === null || this.colorHex === undefined || this.colorHex === '') {
      return true;
    }
    return DOCENTE_COLOR_HEX_REGEX.test(String(this.colorHex).trim());
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();
    
    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('userId')) {
      plainObject.userId = this.userId;
    }
    if (this.hasOwnProperty('ci')) {
      plainObject.ci = this.ci;
    }
    if (this.hasOwnProperty('expedition')) {
      plainObject.expedition = this.expedition;
    }
    if (this.hasOwnProperty('firstName')) {
      plainObject.firstName = this.firstName;
    }
    if (this.hasOwnProperty('lastName')) {
      plainObject.lastName = this.lastName;
    }
    if (this.hasOwnProperty('motherLastName')) {
      plainObject.motherLastName = this.motherLastName;
    }
    if (this.hasOwnProperty('birthDate')) {
      plainObject.birthDate = this.birthDate;
    }
    if (this.hasOwnProperty('gender')) {
      plainObject.gender = this.gender;
    }
    if (this.hasOwnProperty('civilStatusId')) {
      plainObject.civilStatusId = this.civilStatusId;
    }
    if (this.hasOwnProperty('nationality')) {
      plainObject.nationality = this.nationality;
    }
    if (this.hasOwnProperty('phone')) {
      plainObject.phone = this.phone;
    }
    if (this.hasOwnProperty('mobilePhone')) {
      plainObject.mobilePhone = this.mobilePhone;
    }
    if (this.hasOwnProperty('personalEmail')) {
      plainObject.personalEmail = this.personalEmail;
    }
    if (this.hasOwnProperty('address')) {
      plainObject.address = this.address;
    }
    if (this.hasOwnProperty('residenceMunicipalityId')) {
      plainObject.residenceMunicipalityId = this.residenceMunicipalityId;
    }
    if (this.hasOwnProperty('zone')) {
      plainObject.zone = this.zone;
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
    if (this.hasOwnProperty('yearsOfExperience')) {
      plainObject.yearsOfExperience = this.yearsOfExperience;
    }
    if (this.hasOwnProperty('hireDate')) {
      plainObject.hireDate = this.hireDate;
    }
    if (this.hasOwnProperty('retirementDate')) {
      plainObject.retirementDate = this.retirementDate;
    }
    if (this.hasOwnProperty('contractType')) {
      plainObject.contractType = this.contractType;
    }
    if (this.hasOwnProperty('laborState')) {
      plainObject.laborState = this.laborState;
    }
    if (this.hasOwnProperty('observations')) {
      plainObject.observations = this.observations;
    }
    if (this.hasOwnProperty('colorHex')) {
      plainObject.colorHex = this.colorHex;
    }
    if (this.hasOwnProperty('maxHorasSemana')) {
      plainObject.maxHorasSemana = this.maxHorasSemana;
    }
    if (this.hasOwnProperty('maxHorasMes')) {
      plainObject.maxHorasMes = this.maxHorasMes;
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
