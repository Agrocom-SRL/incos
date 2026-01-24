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
    if (data.hasOwnProperty('cellphone1')) {
      this.cellphone1 = data.cellphone1;
    }
    if (data.hasOwnProperty('cellphone2')) {
      this.cellphone2 = data.cellphone2;
    }
    if (data.hasOwnProperty('livesWithStudent')) {
      this.livesWithStudent = data.livesWithStudent;
    } else if (!data.hasOwnProperty('studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.livesWithStudent = false;
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
    if (this.hasOwnProperty('cellphone1')) {
      plainObject.cellphone1 = this.cellphone1;
    }
    if (this.hasOwnProperty('cellphone2')) {
      plainObject.cellphone2 = this.cellphone2;
    }
    if (this.hasOwnProperty('livesWithStudent')) {
      plainObject.livesWithStudent = this.livesWithStudent;
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
