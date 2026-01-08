import { BaseEntity } from './BaseEntity.js';
import { EXPEDICIONES_CI_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: StudentGuardian
 * Representa un apoderado/tutor de un estudiante
 */
export class StudentGuardian extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.studentId = data.studentId || null;
    this.relationshipTypeId = data.relationshipTypeId || null;
    this.firstName = data.firstName || null;
    this.lastName = data.lastName || null;
    this.ci = data.ci || null;
    this.occupation = data.occupation || null;
    this.workplace = data.workplace || null;
    this.address = data.address || null;
    this.phone = data.phone || null;
    this.email = data.email || null;
    this.isEmergencyContact = data.isEmergencyContact !== undefined ? data.isEmergencyContact : true;
    this.livesWithStudent = data.livesWithStudent !== undefined ? data.livesWithStudent : false;
    this.observations = data.observations || null;
  }

  /**
   * Obtiene el nombre completo del apoderado
   * @returns {string}
   */
  getFullName() {
    const parts = [this.firstName, this.lastName];
    return parts.filter(Boolean).join(' ');
  }

  /**
   * Valida el formato del CI (si se proporciona)
   * @returns {boolean}
   */
  isValidCI() {
    if (!this.ci) return true; // Opcional
    return /^\d{7,9}$/.test(this.ci);
  }

  /**
   * Valida el formato del email (si se proporciona)
   * @returns {boolean}
   */
  isValidEmail() {
    if (!this.email) return true; // Opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      studentId: this.studentId,
      relationshipTypeId: this.relationshipTypeId,
      firstName: this.firstName,
      lastName: this.lastName,
      ci: this.ci,
      occupation: this.occupation,
      workplace: this.workplace,
      address: this.address,
      phone: this.phone,
      email: this.email,
      isEmergencyContact: this.isEmergencyContact,
      livesWithStudent: this.livesWithStudent,
      observations: this.observations,
    };
  }
}
