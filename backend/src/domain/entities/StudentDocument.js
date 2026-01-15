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
    if (data.hasOwnProperty('studentId')) {
      this.studentId = data.studentId;
    }
    if (data.hasOwnProperty('tipoDocumento')) {
      this.tipoDocumento = data.tipoDocumento; // INSCRIPCION, LICENCIA, PASANTIA, etc.
    }
    if (data.hasOwnProperty('documentacionId')) {
      this.documentacionId = data.documentacionId; // Documento específico de ese tipo (opcional)
    }
    if (data.hasOwnProperty('fileName')) {
      this.fileName = data.fileName;
    }
    if (data.hasOwnProperty('filePath')) {
      this.filePath = data.filePath;
    }
    if (data.hasOwnProperty('extension')) {
      this.extension = data.extension;
    }
    if (data.hasOwnProperty('tipoMime')) {
      this.tipoMime = data.tipoMime;
    }
    if (data.hasOwnProperty('contieneMultipleDocumentos')) {
      this.contieneMultipleDocumentos = data.contieneMultipleDocumentos;
    } else if (!data.hasOwnProperty('studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.contieneMultipleDocumentos = false;
    }
    if (data.hasOwnProperty('verified')) {
      this.verified = data.verified;
    } else if (!data.hasOwnProperty('studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.verified = false;
    }
    if (data.hasOwnProperty('verifiedBy')) {
      this.verifiedBy = data.verifiedBy;
    }
    if (data.hasOwnProperty('verificationDate')) {
      this.verificationDate = data.verificationDate;
    }
    if (data.hasOwnProperty('verificationObservations')) {
      this.verificationObservations = data.verificationObservations;
    }
    if (data.hasOwnProperty('state')) {
      this.state = data.state;
    } else if (!data.hasOwnProperty('studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.state = ESTADOS_DOCUMENTO.PENDIENTE;
    }
    if (data.hasOwnProperty('rejectionReason')) {
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
    if (this.hasOwnProperty('studentId')) {
      plainObject.studentId = this.studentId;
    }
    if (this.hasOwnProperty('tipoDocumento')) {
      plainObject.tipoDocumento = this.tipoDocumento;
    }
    if (this.hasOwnProperty('documentacionId')) {
      plainObject.documentacionId = this.documentacionId;
    }
    if (this.hasOwnProperty('fileName')) {
      plainObject.fileName = this.fileName;
    }
    if (this.hasOwnProperty('filePath')) {
      plainObject.filePath = this.filePath;
    }
    if (this.hasOwnProperty('extension')) {
      plainObject.extension = this.extension;
    }
    if (this.hasOwnProperty('tipoMime')) {
      plainObject.tipoMime = this.tipoMime;
    }
    if (this.hasOwnProperty('contieneMultipleDocumentos')) {
      plainObject.contieneMultipleDocumentos = this.contieneMultipleDocumentos;
    }
    if (this.hasOwnProperty('verified')) {
      plainObject.verified = this.verified;
    }
    if (this.hasOwnProperty('verifiedBy')) {
      plainObject.verifiedBy = this.verifiedBy;
    }
    if (this.hasOwnProperty('verificationDate')) {
      plainObject.verificationDate = this.verificationDate;
    }
    if (this.hasOwnProperty('verificationObservations')) {
      plainObject.verificationObservations = this.verificationObservations;
    }
    if (this.hasOwnProperty('state')) {
      plainObject.state = this.state;
    }
    if (this.hasOwnProperty('rejectionReason')) {
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
