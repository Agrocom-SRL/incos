import { BaseEntity } from './BaseEntity.js';
import { EXPEDICIONES_CI_VALUES, GENEROS_VALUES, TIPOS_SANGRE_VALUES, EDAD_MINIMA_ESTUDIANTE } from '../constants/index.js';

/**
 * Entidad de Dominio: Student
 * Representa un estudiante del sistema
 * Contiene la lógica de negocio pura del estudiante
 */
export class Student extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados

    // Relaciones
    if (Object.prototype.hasOwnProperty.call(data, 'userId')) {
      this.userId = data.userId;
    }

    // Datos de identificación
    if (Object.prototype.hasOwnProperty.call(data, 'studentCode')) {
      this.studentCode = data.studentCode;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'ci')) {
      this.ci = data.ci;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'expedition')) {
      this.expedition = data.expedition;
    }

    // Datos personales
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
    if (Object.prototype.hasOwnProperty.call(data, 'bloodType')) {
      this.bloodType = data.bloodType;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'hasDisability')) {
      this.hasDisability = data.hasDisability;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'userId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.hasDisability = false;
    }

    // Contacto
    if (Object.prototype.hasOwnProperty.call(data, 'personalEmail')) {
      this.personalEmail = data.personalEmail;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'mobilePhone')) {
      this.mobilePhone = data.mobilePhone;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'landlinePhone')) {
      this.landlinePhone = data.landlinePhone;
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
    if (Object.prototype.hasOwnProperty.call(data, 'observations')) {
      this.observations = data.observations;
    }
    // Datos laborales
    if (Object.prototype.hasOwnProperty.call(data, 'works')) {
      this.works = data.works;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'userId')) {
      this.works = false;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'employerInstitution')) {
      this.employerInstitution = data.employerInstitution;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'position')) {
      this.position = data.position;
    }
  }

  /**
   * Obtiene el nombre completo del estudiante
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
   * Calcula la edad del estudiante
   * @returns {number|null}
   */
  getAge() {
    if (!this.birthDate) return null;
    const today = new Date();
    const birth = new Date(this.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Verifica si el estudiante tiene la edad mínima requerida
   * @returns {boolean}
   */
  hasMinimumAge() {
    const age = this.getAge();
    return age !== null && age >= EDAD_MINIMA_ESTUDIANTE;
  }

  /**
   * Valida el formato del CI
   * @returns {boolean}
   */
  isValidCI() {
    if (!this.ci) return false;
    // CI debe tener entre 7 y 9 dígitos
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
   * Valida el formato del género
   * @returns {boolean}
   */
  isValidGender() {
    if (!this.gender) return false;
    return GENEROS_VALUES.includes(this.gender);
  }

  /**
   * Valida el formato del tipo de sangre
   * @returns {boolean}
   */
  isValidBloodType() {
    if (!this.bloodType) return true; // Opcional
    return TIPOS_SANGRE_VALUES.includes(this.bloodType);
  }

  /**
   * Valida el formato del email
   * @returns {boolean}
   */
  isValidEmail() {
    if (!this.personalEmail) return true; // Opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.personalEmail);
  }

  /**
   * Valida todos los campos requeridos
   * @returns {boolean}
   */
  isValid() {
    return (
      this.isValidCI() &&
      this.isValidExpedition() &&
      this.hasMinimumAge() &&
      this.isValidGender() &&
      this.isValidBloodType() &&
      this.isValidEmail()
    );
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
    if (Object.prototype.hasOwnProperty.call(this, 'studentCode')) {
      plainObject.studentCode = this.studentCode;
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
    if (Object.prototype.hasOwnProperty.call(this, 'bloodType')) {
      plainObject.bloodType = this.bloodType;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'hasDisability')) {
      plainObject.hasDisability = this.hasDisability;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'personalEmail')) {
      plainObject.personalEmail = this.personalEmail;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'mobilePhone')) {
      plainObject.mobilePhone = this.mobilePhone;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'landlinePhone')) {
      plainObject.landlinePhone = this.landlinePhone;
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
    if (Object.prototype.hasOwnProperty.call(this, 'observations')) {
      plainObject.observations = this.observations;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'works')) {
      plainObject.works = this.works;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'employerInstitution')) {
      plainObject.employerInstitution = this.employerInstitution;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'position')) {
      plainObject.position = this.position;
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
