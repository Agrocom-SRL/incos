import { BaseEntity } from './BaseEntity.js';
import { EXPEDICIONES_CI_VALUES, GENEROS_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: Staff
 * Representa un miembro del personal del instituto (torso de rectores/directores/secretarias).
 * Contiene la lógica de negocio pura del personal.
 *
 * Mapeo con BD (tabla personal, 23-personal-usuarios.sql): mismo patrón que Student
 * (userId ← usuario_id, firstName ← nombres, lastName ← apellido_paterno, etc.).
 */
export class Staff extends BaseEntity {
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
    if (Object.prototype.hasOwnProperty.call(data, 'personalEmail')) {
      this.personalEmail = data.personalEmail;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'phone')) {
      this.phone = data.phone;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'mobilePhone')) {
      this.mobilePhone = data.mobilePhone;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'address')) {
      this.address = data.address;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'municipalityId')) {
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
    if (Object.prototype.hasOwnProperty.call(this, 'personalEmail')) {
      plainObject.personalEmail = this.personalEmail;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'phone')) {
      plainObject.phone = this.phone;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'mobilePhone')) {
      plainObject.mobilePhone = this.mobilePhone;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'address')) {
      plainObject.address = this.address;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'municipalityId')) {
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
