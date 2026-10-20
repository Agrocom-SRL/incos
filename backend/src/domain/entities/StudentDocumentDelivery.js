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
    if (Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      this.studentId = data.studentId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'documentacionId')) {
      this.documentacionId = data.documentacionId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'entregado')) {
      this.entregado = data.entregado;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.entregado = false;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'enTramite')) {
      this.enTramite = data.enTramite;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.enTramite = false;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'fechaEntrega')) {
      this.fechaEntrega = data.fechaEntrega;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'observaciones')) {
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
    if (Object.prototype.hasOwnProperty.call(this, 'documentacionId')) {
      plainObject.documentacionId = this.documentacionId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'entregado')) {
      plainObject.entregado = this.entregado;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'enTramite')) {
      plainObject.enTramite = this.enTramite;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'fechaEntrega')) {
      plainObject.fechaEntrega = this.fechaEntrega;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'observaciones')) {
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
