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
    if (Object.prototype.hasOwnProperty.call(data, 'userId')) {
      this.userId = data.userId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'ci')) {
      this.ci = data.ci;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'expedition')) {
      this.expedition = data.expedition;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'firstName')) {
      this.firstName = data.firstName;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'lastName')) {
      this.lastName = data.lastName;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'motherLastName')) {
      this.motherLastName = data.motherLastName;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'birthDate')) {
      this.birthDate = data.birthDate;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'gender')) {
      this.gender = data.gender;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'civilStatusId')) {
      this.civilStatusId = data.civilStatusId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'nationality')) {
      this.nationality = data.nationality;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'userId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.nationality = 'Boliviana';
    }
    if (Object.prototype.hasOwnProperty.call(data, 'phone')) {
      this.phone = data.phone;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'mobilePhone')) {
      this.mobilePhone = data.mobilePhone;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'personalEmail')) {
      this.personalEmail = data.personalEmail;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'address')) {
      this.address = data.address;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'residenceMunicipalityId')) {
      this.residenceMunicipalityId = data.residenceMunicipalityId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'zone')) {
      this.zone = data.zone;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'professionalTitle')) {
      this.professionalTitle = data.professionalTitle;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'specialty')) {
      this.specialty = data.specialty;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'academicLevel')) {
      this.academicLevel = data.academicLevel;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'userId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.academicLevel = NIVELES_ACADEMICOS.LICENCIATURA;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'graduationInstitution')) {
      this.graduationInstitution = data.graduationInstitution;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'graduationYear')) {
      this.graduationYear = data.graduationYear;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'yearsOfExperience')) {
      this.yearsOfExperience = data.yearsOfExperience;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'userId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.yearsOfExperience = 0;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'hireDate')) {
      this.hireDate = data.hireDate;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'retirementDate')) {
      this.retirementDate = data.retirementDate;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'contractType')) {
      this.contractType = data.contractType;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'userId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.contractType = TIPOS_CONTRATO_DOCENTE.CONTRATO;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'laborState')) {
      this.laborState = data.laborState;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'userId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.laborState = ESTADOS_LABORALES.ACTIVO;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'observations')) {
      this.observations = data.observations;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'colorHex')) {
      this.colorHex = data.colorHex;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'maxHorasSemana')) {
      this.maxHorasSemana = data.maxHorasSemana;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'maxHorasMes')) {
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
    if (Object.prototype.hasOwnProperty.call(this, 'userId')) {
      plainObject.userId = this.userId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'ci')) {
      plainObject.ci = this.ci;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'expedition')) {
      plainObject.expedition = this.expedition;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'firstName')) {
      plainObject.firstName = this.firstName;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'lastName')) {
      plainObject.lastName = this.lastName;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'motherLastName')) {
      plainObject.motherLastName = this.motherLastName;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'birthDate')) {
      plainObject.birthDate = this.birthDate;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'gender')) {
      plainObject.gender = this.gender;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'civilStatusId')) {
      plainObject.civilStatusId = this.civilStatusId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'nationality')) {
      plainObject.nationality = this.nationality;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'phone')) {
      plainObject.phone = this.phone;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'mobilePhone')) {
      plainObject.mobilePhone = this.mobilePhone;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'personalEmail')) {
      plainObject.personalEmail = this.personalEmail;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'address')) {
      plainObject.address = this.address;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'residenceMunicipalityId')) {
      plainObject.residenceMunicipalityId = this.residenceMunicipalityId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'zone')) {
      plainObject.zone = this.zone;
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
    if (Object.prototype.hasOwnProperty.call(this, 'yearsOfExperience')) {
      plainObject.yearsOfExperience = this.yearsOfExperience;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'hireDate')) {
      plainObject.hireDate = this.hireDate;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'retirementDate')) {
      plainObject.retirementDate = this.retirementDate;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'contractType')) {
      plainObject.contractType = this.contractType;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'laborState')) {
      plainObject.laborState = this.laborState;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'observations')) {
      plainObject.observations = this.observations;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'colorHex')) {
      plainObject.colorHex = this.colorHex;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'maxHorasSemana')) {
      plainObject.maxHorasSemana = this.maxHorasSemana;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'maxHorasMes')) {
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
