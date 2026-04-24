import { BaseEntity } from './BaseEntity.js';
import { EXPEDICIONES_CI_VALUES, GENEROS_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: Staff
 * Representa un miembro del personal del instituto (torso de rectores/directores/secretarias).
 * Contiene la lógica de negocio pura del personal.
 *
 * Mapeo con BD (tabla personal, 22-personal-usuarios.sql): mismo patrón que Student
 * (userId ← usuario_id, firstName ← nombres, lastName ← apellido_paterno, etc.).
 */
export class Staff extends BaseEntity {
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
    if (data.hasOwnProperty('personalEmail')) {
      this.personalEmail = data.personalEmail;
    }
    if (data.hasOwnProperty('phone')) {
      this.phone = data.phone;
    }
    if (data.hasOwnProperty('mobilePhone')) {
      this.mobilePhone = data.mobilePhone;
    }
    if (data.hasOwnProperty('address')) {
      this.address = data.address;
    }
    if (data.hasOwnProperty('municipalityId')) {
      this.municipalityId = data.municipalityId;
    }
  }

  /**
   * Obtiene el nombre completo del personal
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
    if (!this.expedition || String(this.expedition).trim() === '') return true;
    return EXPEDICIONES_CI_VALUES.includes(this.expedition);
  }

  /**
   * Valida el formato del género
   * @returns {boolean}
   */
  isValidGender() {
    if (!this.gender) return true; // Opcional
    return GENEROS_VALUES.includes(this.gender);
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
    if (this.hasOwnProperty('personalEmail')) {
      plainObject.personalEmail = this.personalEmail;
    }
    if (this.hasOwnProperty('phone')) {
      plainObject.phone = this.phone;
    }
    if (this.hasOwnProperty('mobilePhone')) {
      plainObject.mobilePhone = this.mobilePhone;
    }
    if (this.hasOwnProperty('address')) {
      plainObject.address = this.address;
    }
    if (this.hasOwnProperty('municipalityId')) {
      plainObject.municipalityId = this.municipalityId;
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
