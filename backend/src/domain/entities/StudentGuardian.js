import { BaseEntity } from './BaseEntity.js';
import { EXPEDICIONES_CI_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: StudentGuardian
 * Representa un apoderado/tutor de un estudiante
 */
export class StudentGuardian extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('studentId')) {
      this.studentId = data.studentId;
    }
    if (data.hasOwnProperty('relationshipTypeId')) {
      this.relationshipTypeId = data.relationshipTypeId;
    }
    if (data.hasOwnProperty('firstName')) {
      this.firstName = data.firstName;
    }
    if (data.hasOwnProperty('lastName')) {
      this.lastName = data.lastName;
    }
    if (data.hasOwnProperty('ci')) {
      this.ci = data.ci;
    }
    if (data.hasOwnProperty('occupation')) {
      this.occupation = data.occupation;
    }
    if (data.hasOwnProperty('workplace')) {
      this.workplace = data.workplace;
    }
    if (data.hasOwnProperty('address')) {
      this.address = data.address;
    }
    if (data.hasOwnProperty('phone')) {
      this.phone = data.phone;
    }
    if (data.hasOwnProperty('email')) {
      this.email = data.email;
    }
    if (data.hasOwnProperty('isEmergencyContact')) {
      this.isEmergencyContact = data.isEmergencyContact;
    } else if (!data.hasOwnProperty('studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.isEmergencyContact = true;
    }
    if (data.hasOwnProperty('livesWithStudent')) {
      this.livesWithStudent = data.livesWithStudent;
    } else if (!data.hasOwnProperty('studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.livesWithStudent = false;
    }
    if (data.hasOwnProperty('observations')) {
      this.observations = data.observations;
    }
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
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();
    
    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('studentId')) {
      plainObject.studentId = this.studentId;
    }
    if (this.hasOwnProperty('relationshipTypeId')) {
      plainObject.relationshipTypeId = this.relationshipTypeId;
    }
    if (this.hasOwnProperty('firstName')) {
      plainObject.firstName = this.firstName;
    }
    if (this.hasOwnProperty('lastName')) {
      plainObject.lastName = this.lastName;
    }
    if (this.hasOwnProperty('ci')) {
      plainObject.ci = this.ci;
    }
    if (this.hasOwnProperty('occupation')) {
      plainObject.occupation = this.occupation;
    }
    if (this.hasOwnProperty('workplace')) {
      plainObject.workplace = this.workplace;
    }
    if (this.hasOwnProperty('address')) {
      plainObject.address = this.address;
    }
    if (this.hasOwnProperty('phone')) {
      plainObject.phone = this.phone;
    }
    if (this.hasOwnProperty('email')) {
      plainObject.email = this.email;
    }
    if (this.hasOwnProperty('isEmergencyContact')) {
      plainObject.isEmergencyContact = this.isEmergencyContact;
    }
    if (this.hasOwnProperty('livesWithStudent')) {
      plainObject.livesWithStudent = this.livesWithStudent;
    }
    if (this.hasOwnProperty('observations')) {
      plainObject.observations = this.observations;
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
