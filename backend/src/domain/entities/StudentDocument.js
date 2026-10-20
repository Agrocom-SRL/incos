import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_DOCUMENTO_VALUES, ESTADOS_DOCUMENTO } from '../constants/index.js';

/**
 * Entidad de Dominio: StudentDocument
 * Representa un documento de un estudiante
 */
export class StudentDocument extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      this.studentId = data.studentId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'tipoDocumento')) {
      this.tipoDocumento = data.tipoDocumento; // INSCRIPCION, LICENCIA, PASANTIA, etc.
    }
    if (Object.prototype.hasOwnProperty.call(data, 'documentacionId')) {
      this.documentacionId = data.documentacionId; // Documento específico de ese tipo (opcional)
    }
    if (Object.prototype.hasOwnProperty.call(data, 'fileName')) {
      this.fileName = data.fileName;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'filePath')) {
      this.filePath = data.filePath;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'extension')) {
      this.extension = data.extension;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'tipoMime')) {
      this.tipoMime = data.tipoMime;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'contieneMultipleDocumentos')) {
      this.contieneMultipleDocumentos = data.contieneMultipleDocumentos;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.contieneMultipleDocumentos = false;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'verified')) {
      this.verified = data.verified;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.verified = false;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'verifiedBy')) {
      this.verifiedBy = data.verifiedBy;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'verificationDate')) {
      this.verificationDate = data.verificationDate;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'verificationObservations')) {
      this.verificationObservations = data.verificationObservations;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'state')) {
      this.state = data.state;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.state = ESTADOS_DOCUMENTO.PENDIENTE;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'rejectionReason')) {
      this.rejectionReason = data.rejectionReason;
    }
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
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (Object.prototype.hasOwnProperty.call(this, 'studentId')) {
      plainObject.studentId = this.studentId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'tipoDocumento')) {
      plainObject.tipoDocumento = this.tipoDocumento;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'documentacionId')) {
      plainObject.documentacionId = this.documentacionId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'fileName')) {
      plainObject.fileName = this.fileName;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'filePath')) {
      plainObject.filePath = this.filePath;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'extension')) {
      plainObject.extension = this.extension;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'tipoMime')) {
      plainObject.tipoMime = this.tipoMime;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'contieneMultipleDocumentos')) {
      plainObject.contieneMultipleDocumentos = this.contieneMultipleDocumentos;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'verified')) {
      plainObject.verified = this.verified;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'verifiedBy')) {
      plainObject.verifiedBy = this.verifiedBy;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'verificationDate')) {
      plainObject.verificationDate = this.verificationDate;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'verificationObservations')) {
      plainObject.verificationObservations = this.verificationObservations;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'state')) {
      plainObject.state = this.state;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'rejectionReason')) {
      plainObject.rejectionReason = this.rejectionReason;
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
