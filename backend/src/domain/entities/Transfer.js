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
    if (data.hasOwnProperty('tieneActaCompromiso')) {
      this.tieneActaCompromiso = data.tieneActaCompromiso;
    }
    if (data.hasOwnProperty('fechaActaCompromiso')) {
      this.fechaActaCompromiso = data.fechaActaCompromiso;
    }
    if (data.hasOwnProperty('estado')) {
      this.estado = data.estado;
    }
    if (data.hasOwnProperty('fechaSolicitud')) {
      this.fechaSolicitud = data.fechaSolicitud;
    }
    if (data.hasOwnProperty('fechaResolucion')) {
      this.fechaResolucion = data.fechaResolucion;
    }
    if (data.hasOwnProperty('resueltoPor')) {
      this.resueltoPor = data.resueltoPor;
    }
    if (data.hasOwnProperty('motivoNoProcedente')) {
      this.motivoNoProcedente = data.motivoNoProcedente;
    }
    if (data.hasOwnProperty('observaciones')) {
      this.observaciones = data.observaciones;
    }
    if (data.hasOwnProperty('carreraDestinoId')) {
      this.carreraDestinoId = data.carreraDestinoId;
    }
    if (data.hasOwnProperty('planEstudioDestinoId')) {
      this.planEstudioDestinoId = data.planEstudioDestinoId;
    }
    if (data.hasOwnProperty('periodoDestinoId')) {
      this.periodoDestinoId = data.periodoDestinoId;
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
    if (this.hasOwnProperty('tieneActaCompromiso')) {
      plainObject.tieneActaCompromiso = this.tieneActaCompromiso;
    }
    if (this.hasOwnProperty('fechaActaCompromiso')) {
      plainObject.fechaActaCompromiso = this.fechaActaCompromiso;
    }
    if (this.hasOwnProperty('estado')) {
      plainObject.estado = this.estado;
    }
    if (this.hasOwnProperty('fechaSolicitud')) {
      plainObject.fechaSolicitud = this.fechaSolicitud;
    }
    if (this.hasOwnProperty('fechaResolucion')) {
      plainObject.fechaResolucion = this.fechaResolucion;
    }
    if (this.hasOwnProperty('resueltoPor')) {
      plainObject.resueltoPor = this.resueltoPor;
    }
    if (this.hasOwnProperty('motivoNoProcedente')) {
      plainObject.motivoNoProcedente = this.motivoNoProcedente;
    }
    if (this.hasOwnProperty('observaciones')) {
      plainObject.observaciones = this.observaciones;
    }
    if (this.hasOwnProperty('carreraDestinoId')) {
      plainObject.carreraDestinoId = this.carreraDestinoId;
    }
    if (this.hasOwnProperty('planEstudioDestinoId')) {
      plainObject.planEstudioDestinoId = this.planEstudioDestinoId;
    }
    if (this.hasOwnProperty('periodoDestinoId')) {
      plainObject.periodoDestinoId = this.periodoDestinoId;
    }

    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}
