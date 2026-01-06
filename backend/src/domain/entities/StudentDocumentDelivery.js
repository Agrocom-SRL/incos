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
    this.studentId = data.studentId || null;
    this.documentacionId = data.documentacionId || null;
    this.entregado = data.entregado !== undefined ? data.entregado : false;
    this.enTramite = data.enTramite !== undefined ? data.enTramite : false;
    this.esOriginal = data.esOriginal !== undefined ? data.esOriginal : false;
    this.fechaEntrega = data.fechaEntrega || null;
    this.fechaVencimientoTramite = data.fechaVencimientoTramite || null;
    this.observaciones = data.observaciones || null;
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
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      studentId: this.studentId,
      documentacionId: this.documentacionId,
      entregado: this.entregado,
      enTramite: this.enTramite,
      esOriginal: this.esOriginal,
      fechaEntrega: this.fechaEntrega,
      fechaVencimientoTramite: this.fechaVencimientoTramite,
      observaciones: this.observaciones,
    };
  }
}
