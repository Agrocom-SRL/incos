import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Documentation
 * Representa un tipo de documentación requerida para inscripción
 */
export class Documentation extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.name = data.name || null;
    this.documentType = data.documentType || null;
    this.acceptsPhotocopy = data.acceptsPhotocopy !== undefined ? data.acceptsPhotocopy : false;
    this.required = data.required !== undefined ? data.required : true;
    this.order = data.order || 0;
    this.description = data.description || null;
    this.parentDocumentId = data.parentDocumentId !== undefined ? data.parentDocumentId : null;
    this.isOriginal = data.isOriginal !== undefined ? data.isOriginal : false;
    this.isSystemDocument = data.isSystemDocument !== undefined ? data.isSystemDocument : false;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      name: this.name,
      documentType: this.documentType,
      acceptsPhotocopy: this.acceptsPhotocopy,
      required: this.required,
      order: this.order,
      description: this.description,
      parentDocumentId: this.parentDocumentId,
      isOriginal: this.isOriginal,
      isSystemDocument: this.isSystemDocument,
    };
  }
}

