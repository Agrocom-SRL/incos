import { BaseEntity } from './BaseEntity.js';
import { EXPEDICIONES_CI_VALUES, GENEROS_VALUES } from '../../shared/constants/index.js';

/**
 * Entidad de Dominio: Staff
 * Representa un miembro del personal del instituto
 */
export class Staff extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.userId = data.userId || null;
    this.ci = data.ci || null;
    this.expedition = data.expedition || null;
    this.firstName = data.firstName || null;
    this.lastName = data.lastName || null;
    this.motherLastName = data.motherLastName || null;
    this.birthDate = data.birthDate || null;
    this.gender = data.gender || null;
    this.civilStatusId = data.civilStatusId || null;
    this.personalEmail = data.personalEmail || null;
    this.phone = data.phone || null;
    this.mobilePhone = data.mobilePhone || null;
    this.address = data.address || null;
    this.municipalityId = data.municipalityId || null;
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
    if (!this.expedition) return false;
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
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      userId: this.userId,
      ci: this.ci,
      expedition: this.expedition,
      firstName: this.firstName,
      lastName: this.lastName,
      motherLastName: this.motherLastName,
      birthDate: this.birthDate,
      gender: this.gender,
      civilStatusId: this.civilStatusId,
      personalEmail: this.personalEmail,
      phone: this.phone,
      mobilePhone: this.mobilePhone,
      address: this.address,
      municipalityId: this.municipalityId,
    };
  }
}
