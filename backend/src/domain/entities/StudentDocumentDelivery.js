import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: StudentDocumentDelivery
 * Representa la relación entre un estudiante y un documento requerido
 * (entrega física de documentos)
 * 
 * IMPORTANTE: Esta entidad representa la relación entre un estudiante y un tipo de documento requerido.
 * Indica si el documento fue entregado, si está en trámite, fecha de entrega, etc.
 * NO almacena archivos digitales, solo el estado de la relación estudiante-documento.
 * Los archivos digitales se almacenan en StudentDocument.
 */
export class StudentDocumentDelivery extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('studentId')) {
      this.studentId = data.studentId;
    }
    if (data.hasOwnProperty('documentacionId')) {
      this.documentacionId = data.documentacionId;
    }
    if (data.hasOwnProperty('entregado')) {
      this.entregado = data.entregado;
    } else if (!data.hasOwnProperty('studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.entregado = false;
    }
    if (data.hasOwnProperty('enTramite')) {
      this.enTramite = data.enTramite;
    } else if (!data.hasOwnProperty('studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.enTramite = false;
    }
    if (data.hasOwnProperty('esOriginal')) {
      this.esOriginal = data.esOriginal;
    } else if (!data.hasOwnProperty('studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.esOriginal = false;
    }
    if (data.hasOwnProperty('fechaEntrega')) {
      this.fechaEntrega = data.fechaEntrega;
    }
    if (data.hasOwnProperty('fechaVencimientoTramite')) {
      this.fechaVencimientoTramite = data.fechaVencimientoTramite;
    }
    if (data.hasOwnProperty('observaciones')) {
      this.observaciones = data.observaciones;
    }
  }

  /**
   * Verifica si el documento fue entregado
   * @returns {boolean}
   */
  isDelivered() {
    return this.entregado === true;
  }

  /**
   * Verifica si el documento está en trámite
   * @returns {boolean}
   */
  isInProcess() {
    return this.enTramite === true;
  }

  /**
   * Verifica si el documento es original
   * @returns {boolean}
   */
  isOriginal() {
    return this.esOriginal === true;
  }

  /**
   * Verifica si el trámite está vencido
   * @returns {boolean}
   */
  isTramiteExpired() {
    if (!this.enTramite || !this.fechaVencimientoTramite) {
      return false;
    }
    const today = new Date();
    const vencimiento = new Date(this.fechaVencimientoTramite);
    return today > vencimiento;
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
    if (this.hasOwnProperty('documentacionId')) {
      plainObject.documentacionId = this.documentacionId;
    }
    if (this.hasOwnProperty('entregado')) {
      plainObject.entregado = this.entregado;
    }
    if (this.hasOwnProperty('enTramite')) {
      plainObject.enTramite = this.enTramite;
    }
    if (this.hasOwnProperty('esOriginal')) {
      plainObject.esOriginal = this.esOriginal;
    }
    if (this.hasOwnProperty('fechaEntrega')) {
      plainObject.fechaEntrega = this.fechaEntrega;
    }
    if (this.hasOwnProperty('fechaVencimientoTramite')) {
      plainObject.fechaVencimientoTramite = this.fechaVencimientoTramite;
    }
    if (this.hasOwnProperty('observaciones')) {
      plainObject.observaciones = this.observaciones;
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
