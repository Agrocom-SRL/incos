import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de dominio: Transfer
 * Representa una solicitud de traspaso (TRASPASO) asociada a un estudiante.
 *
 * Sigue el mismo patrón que Student:
 * - Solo inicializa campos si vienen en data (hasOwnProperty)
 * - toPlainObject() solo incluye campos inicializados
 */
export class Transfer extends BaseEntity {
  constructor(data = {}) {
    super(data);

    if (data.hasOwnProperty('estudianteId')) {
      this.estudianteId = data.estudianteId;
    }
    if (data.hasOwnProperty('institucionOrigenId')) {
      this.institucionOrigenId = data.institucionOrigenId;
    }
    if (data.hasOwnProperty('carreraOrigen')) {
      this.carreraOrigen = data.carreraOrigen;
    }
    if (data.hasOwnProperty('anioCursado')) {
      this.anioCursado = data.anioCursado;
    }
    if (data.hasOwnProperty('regimenOrigen')) {
      this.regimenOrigen = data.regimenOrigen;
    }
    if (data.hasOwnProperty('estado')) {
      this.estado = data.estado;
    }
    if (data.hasOwnProperty('fechaSolicitud')) {
      this.fechaSolicitud = data.fechaSolicitud;
    }
    if (data.hasOwnProperty('motivoNoProcedente')) {
      this.motivoNoProcedente = data.motivoNoProcedente;
    }
    if (data.hasOwnProperty('observaciones')) {
      this.observaciones = data.observaciones;
    }
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos inicializados, igual que Student.toPlainObject()
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    if (this.hasOwnProperty('estudianteId')) {
      plainObject.estudianteId = this.estudianteId;
    }
    if (this.hasOwnProperty('institucionOrigenId')) {
      plainObject.institucionOrigenId = this.institucionOrigenId;
    }
    if (this.hasOwnProperty('carreraOrigen')) {
      plainObject.carreraOrigen = this.carreraOrigen;
    }
    if (this.hasOwnProperty('anioCursado')) {
      plainObject.anioCursado = this.anioCursado;
    }
    if (this.hasOwnProperty('regimenOrigen')) {
      plainObject.regimenOrigen = this.regimenOrigen;
    }
    if (this.hasOwnProperty('estado')) {
      plainObject.estado = this.estado;
    }
    if (this.hasOwnProperty('fechaSolicitud')) {
      plainObject.fechaSolicitud = this.fechaSolicitud;
    }
    if (this.hasOwnProperty('motivoNoProcedente')) {
      plainObject.motivoNoProcedente = this.motivoNoProcedente;
    }
    if (this.hasOwnProperty('observaciones')) {
      plainObject.observaciones = this.observaciones;
    }

    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}
