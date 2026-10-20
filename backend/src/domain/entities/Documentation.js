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
    if (Object.prototype.hasOwnProperty.call(data, 'name')) {
      this.name = data.name;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'documentType')) {
      this.documentType = data.documentType;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'acceptsPhotocopy')) {
      this.acceptsPhotocopy = data.acceptsPhotocopy;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.acceptsPhotocopy = false;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'required')) {
      this.required = data.required;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.required = true;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'order')) {
      this.order = data.order;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.order = 0;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'description')) {
      this.description = data.description;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'parentDocumentId')) {
      this.parentDocumentId = data.parentDocumentId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'isSystemDocument')) {
      this.isSystemDocument = data.isSystemDocument;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'name')) {
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
    if (Object.prototype.hasOwnProperty.call(this, 'name')) {
      plainObject.name = this.name;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'documentType')) {
      plainObject.documentType = this.documentType;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'acceptsPhotocopy')) {
      plainObject.acceptsPhotocopy = this.acceptsPhotocopy;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'required')) {
      plainObject.required = this.required;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'order')) {
      plainObject.order = this.order;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'description')) {
      plainObject.description = this.description;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'parentDocumentId')) {
      plainObject.parentDocumentId = this.parentDocumentId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'isSystemDocument')) {
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
