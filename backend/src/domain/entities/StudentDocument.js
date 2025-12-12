import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: StudentDocument
 * Representa un documento de un estudiante
 */
export class StudentDocument extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.studentId = data.studentId || null;
    this.documentType = data.documentType || null;
    this.documentReason = data.documentReason || null;
    this.referenceType = data.referenceType || null;
    this.referenceId = data.referenceId || null;
    this.description = data.description || null;
    this.fileName = data.fileName || null;
    this.filePath = data.filePath || null;
    this.extension = data.extension || null;
    this.sizeKb = data.sizeKb || null;
    this.verified = data.verified !== undefined ? data.verified : false;
    this.verifiedBy = data.verifiedBy || null;
    this.verificationDate = data.verificationDate || null;
    this.verificationObservations = data.verificationObservations || null;
    this.state = data.state || 'PENDIENTE'; // PENDIENTE, APROBADO, RECHAZADO, REQUERIDO
    this.rejectionReason = data.rejectionReason || null;
  }

  /**
   * Valida el tipo de documento
   * @returns {boolean}
   */
  isValidDocumentType() {
    if (!this.documentType) return false;
    return TIPOS_DOCUMENTO_ESTUDIANTE_VALUES.includes(this.documentType);
  }

  /**
   * Valida el estado del documento
   * @returns {boolean}
   */
  isValidState() {
    if (!this.state) return false;
    return ESTADOS_DOCUMENTO_VALUES.includes(this.state);
  }

  /**
   * Verifica si el documento está aprobado
   * @returns {boolean}
   */
  isApproved() {
    return this.state === 'APROBADO';
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      studentId: this.studentId,
      documentType: this.documentType,
      documentReason: this.documentReason,
      referenceType: this.referenceType,
      referenceId: this.referenceId,
      description: this.description,
      fileName: this.fileName,
      filePath: this.filePath,
      extension: this.extension,
      sizeKb: this.sizeKb,
      verified: this.verified,
      verifiedBy: this.verifiedBy,
      verificationDate: this.verificationDate,
      verificationObservations: this.verificationObservations,
      state: this.state,
      rejectionReason: this.rejectionReason,
    };
  }
}
