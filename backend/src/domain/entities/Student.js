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
    if (data.hasOwnProperty('userId')) {
      this.userId = data.userId;
    }

    // Datos de identificación
    if (data.hasOwnProperty('studentCode')) {
      this.studentCode = data.studentCode;
    }
    if (data.hasOwnProperty('ci')) {
      this.ci = data.ci;
    }
    if (data.hasOwnProperty('expedition')) {
      this.expedition = data.expedition;
    }

    // Datos personales
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
    if (data.hasOwnProperty('bloodType')) {
      this.bloodType = data.bloodType;
    }
    if (data.hasOwnProperty('hasDisability')) {
      this.hasDisability = data.hasDisability;
    } else if (!data.hasOwnProperty('userId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.hasDisability = false;
    }

    // Contacto
    if (data.hasOwnProperty('personalEmail')) {
      this.personalEmail = data.personalEmail;
    }
    if (data.hasOwnProperty('mobilePhone')) {
      this.mobilePhone = data.mobilePhone;
    }
    if (data.hasOwnProperty('landlinePhone')) {
      this.landlinePhone = data.landlinePhone;
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
    if (data.hasOwnProperty('observations')) {
      this.observations = data.observations;
    }
    // Datos laborales
    if (data.hasOwnProperty('works')) {
      this.works = data.works;
    } else if (!data.hasOwnProperty('userId')) {
      this.works = false;
    }
    if (data.hasOwnProperty('employerInstitution')) {
      this.employerInstitution = data.employerInstitution;
    }
    if (data.hasOwnProperty('position')) {
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
    if (this.hasOwnProperty('userId')) {
      plainObject.userId = this.userId;
    }
    if (this.hasOwnProperty('studentCode')) {
      plainObject.studentCode = this.studentCode;
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
    if (this.hasOwnProperty('bloodType')) {
      plainObject.bloodType = this.bloodType;
    }
    if (this.hasOwnProperty('hasDisability')) {
      plainObject.hasDisability = this.hasDisability;
    }
    if (this.hasOwnProperty('personalEmail')) {
      plainObject.personalEmail = this.personalEmail;
    }
    if (this.hasOwnProperty('mobilePhone')) {
      plainObject.mobilePhone = this.mobilePhone;
    }
    if (this.hasOwnProperty('landlinePhone')) {
      plainObject.landlinePhone = this.landlinePhone;
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
    if (this.hasOwnProperty('observations')) {
      plainObject.observations = this.observations;
    }
    if (this.hasOwnProperty('works')) {
      plainObject.works = this.works;
    }
    if (this.hasOwnProperty('employerInstitution')) {
      plainObject.employerInstitution = this.employerInstitution;
    }
    if (this.hasOwnProperty('position')) {
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
