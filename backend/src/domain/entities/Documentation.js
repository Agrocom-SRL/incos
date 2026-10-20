import { BaseEntity } from './BaseEntity.js';
import { TIPOS_DOCUMENTO_SISTEMA_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: Documentation
 * Representa un tipo de documentación requerida para inscripción
 */
export class Documentation extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('name')) {
      this.name = data.name;
    }
    if (data.hasOwnProperty('documentType')) {
      this.documentType = data.documentType;
    }
    if (data.hasOwnProperty('acceptsPhotocopy')) {
      this.acceptsPhotocopy = data.acceptsPhotocopy;
    } else if (!data.hasOwnProperty('name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.acceptsPhotocopy = false;
    }
    if (data.hasOwnProperty('required')) {
      this.required = data.required;
    } else if (!data.hasOwnProperty('name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.required = true;
    }
    if (data.hasOwnProperty('order')) {
      this.order = data.order;
    } else if (!data.hasOwnProperty('name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.order = 0;
    }
    if (data.hasOwnProperty('description')) {
      this.description = data.description;
    }
    if (data.hasOwnProperty('parentDocumentId')) {
      this.parentDocumentId = data.parentDocumentId;
    }
    if (data.hasOwnProperty('isSystemDocument')) {
      this.isSystemDocument = data.isSystemDocument;
    } else if (!data.hasOwnProperty('name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.isSystemDocument = false;
    }
  }

  /**
   * Valida el tipo de documento
   * @returns {boolean}
   */
  isValidDocumentType() {
    if (!this.documentType) return false;
    return TIPOS_DOCUMENTO_SISTEMA_VALUES.includes(this.documentType);
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('name')) {
      plainObject.name = this.name;
    }
    if (this.hasOwnProperty('documentType')) {
      plainObject.documentType = this.documentType;
    }
    if (this.hasOwnProperty('acceptsPhotocopy')) {
      plainObject.acceptsPhotocopy = this.acceptsPhotocopy;
    }
    if (this.hasOwnProperty('required')) {
      plainObject.required = this.required;
    }
    if (this.hasOwnProperty('order')) {
      plainObject.order = this.order;
    }
    if (this.hasOwnProperty('description')) {
      plainObject.description = this.description;
    }
    if (this.hasOwnProperty('parentDocumentId')) {
      plainObject.parentDocumentId = this.parentDocumentId;
    }
    if (this.hasOwnProperty('isSystemDocument')) {
      plainObject.isSystemDocument = this.isSystemDocument;
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
