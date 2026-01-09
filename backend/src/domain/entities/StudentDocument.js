import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_DOCUMENTO_VALUES, ESTADOS_DOCUMENTO } from '../constants/index.js';

/**
 * Entidad de Dominio: StudentDocument
 * Representa un documento de un estudiante
 */
export class StudentDocument extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.studentId = data.studentId || null;
    this.tipoDocumento = data.tipoDocumento || null; // INSCRIPCION, LICENCIA, PASANTIA, etc.
    this.documentacionId = data.documentacionId || null; // Documento específico de ese tipo (opcional)
    this.fileName = data.fileName || null;
    this.filePath = data.filePath || null;
    this.extension = data.extension || null;
    this.tipoMime = data.tipoMime || null;
    this.contieneMultipleDocumentos = data.contieneMultipleDocumentos !== undefined ? data.contieneMultipleDocumentos : false;
    this.verified = data.verified !== undefined ? data.verified : false;
    this.verifiedBy = data.verifiedBy || null;
    this.verificationDate = data.verificationDate || null;
    this.verificationObservations = data.verificationObservations || null;
    this.state = data.state || ESTADOS_DOCUMENTO.PENDIENTE;
    this.rejectionReason = data.rejectionReason || null;
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
    return this.state === ESTADOS_DOCUMENTO.APROBADO;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      studentId: this.studentId,
      tipoDocumento: this.tipoDocumento,
      documentacionId: this.documentacionId,
      fileName: this.fileName,
      filePath: this.filePath,
      extension: this.extension,
      tipoMime: this.tipoMime,
      contieneMultipleDocumentos: this.contieneMultipleDocumentos,
      verified: this.verified,
      verifiedBy: this.verifiedBy,
      verificationDate: this.verificationDate,
      verificationObservations: this.verificationObservations,
      state: this.state,
      rejectionReason: this.rejectionReason,
    };
  }
}
