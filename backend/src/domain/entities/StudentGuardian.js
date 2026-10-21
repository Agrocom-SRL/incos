import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: StudentGuardian
 * Representa un apoderado/tutor de un estudiante
 */
export class StudentGuardian extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      this.studentId = data.studentId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'relationshipTypeId')) {
      this.relationshipTypeId = data.relationshipTypeId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'firstName')) {
      this.firstName = data.firstName;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'lastName')) {
      this.lastName = data.lastName;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'cellphone1')) {
      this.cellphone1 = data.cellphone1;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'cellphone2')) {
      this.cellphone2 = data.cellphone2;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'livesWithStudent')) {
      this.livesWithStudent = data.livesWithStudent;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'studentId')) {
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
    if (Object.prototype.hasOwnProperty.call(this, 'studentId')) {
      plainObject.studentId = this.studentId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'relationshipTypeId')) {
      plainObject.relationshipTypeId = this.relationshipTypeId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'firstName')) {
      plainObject.firstName = this.firstName;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'lastName')) {
      plainObject.lastName = this.lastName;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'cellphone1')) {
      plainObject.cellphone1 = this.cellphone1;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'cellphone2')) {
      plainObject.cellphone2 = this.cellphone2;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'livesWithStudent')) {
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
