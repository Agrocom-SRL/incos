import { BaseEntity } from './BaseEntity.js';
import { EXPEDICIONES_CI_VALUES, GENEROS_VALUES, TIPOS_SANGRE_VALUES, EDAD_MINIMA_ESTUDIANTE } from '../../shared/constants/index.js';

/**
 * Entidad de Dominio: Student
 * Representa un estudiante del sistema
 * Contiene la lógica de negocio pura del estudiante
 */
export class Student extends BaseEntity {
  constructor(data = {}) {
    super(data);
    
    // Relaciones
    this.userId = data.userId || null;
    
    // Datos de identificación
    this.studentCode = data.studentCode || null;
    this.ci = data.ci || null;
    this.expedition = data.expedition || null;
    
    // Datos personales
    this.firstName = data.firstName || null;
    this.lastName = data.lastName || null;
    this.motherLastName = data.motherLastName || null;
    this.birthDate = data.birthDate || null;
    this.gender = data.gender || null;
    this.civilStatusId = data.civilStatusId || null;
    this.nationality = data.nationality || 'Boliviana';
    this.birthMunicipalityId = data.birthMunicipalityId || null;
    this.birthCity = data.birthCity || null;
    this.nativeLanguageId = data.nativeLanguageId || null;
    this.bloodType = data.bloodType || null;
    this.hasDisability = data.hasDisability !== undefined ? data.hasDisability : false;
    this.disabilityTypeId = data.disabilityTypeId || null;
    
    // Contacto
    this.personalEmail = data.personalEmail || null;
    this.mobilePhone = data.mobilePhone || null;
    this.landlinePhone = data.landlinePhone || null;
    this.address = data.address || null;
    this.residenceMunicipalityId = data.residenceMunicipalityId || null;
    this.zone = data.zone || null;
    this.observations = data.observations || null;
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
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      userId: this.userId,
      studentCode: this.studentCode,
      ci: this.ci,
      expedition: this.expedition,
      firstName: this.firstName,
      lastName: this.lastName,
      motherLastName: this.motherLastName,
      birthDate: this.birthDate,
      gender: this.gender,
      civilStatusId: this.civilStatusId,
      nationality: this.nationality,
      birthMunicipalityId: this.birthMunicipalityId,
      birthCity: this.birthCity,
      nativeLanguageId: this.nativeLanguageId,
      bloodType: this.bloodType,
      hasDisability: this.hasDisability,
      disabilityTypeId: this.disabilityTypeId,
      personalEmail: this.personalEmail,
      mobilePhone: this.mobilePhone,
      landlinePhone: this.landlinePhone,
      address: this.address,
      residenceMunicipalityId: this.residenceMunicipalityId,
      zone: this.zone,
      observations: this.observations,
    };
  }
}
