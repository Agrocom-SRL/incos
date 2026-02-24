import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de dominio: Transitability
 * Representa una solicitud de transitabilidad (TRANSITABILIDAD) asociada a un estudiante.
 *
 * Sigue el mismo patrón que Student:
 * - Solo inicializa campos si vienen en data (hasOwnProperty)
 * - toPlainObject() solo incluye campos inicializados
 */
export class Transitability extends BaseEntity {
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
    if (data.hasOwnProperty('anioConclusion')) {
      this.anioConclusion = data.anioConclusion;
    }
    if (data.hasOwnProperty('carreraDestinoId')) {
      this.carreraDestinoId = data.carreraDestinoId;
    }
    if (data.hasOwnProperty('planEstudioDestinoId')) {
      this.planEstudioDestinoId = data.planEstudioDestinoId;
    }
    if (data.hasOwnProperty('regimenEstudios')) {
      this.regimenEstudios = data.regimenEstudios;
    }
    if (data.hasOwnProperty('aceptaCompromiso')) {
      this.aceptaCompromiso = data.aceptaCompromiso;
    }
    if (data.hasOwnProperty('fechaCompromiso')) {
      this.fechaCompromiso = data.fechaCompromiso;
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
    if (this.hasOwnProperty('anioConclusion')) {
      plainObject.anioConclusion = this.anioConclusion;
    }
    if (this.hasOwnProperty('carreraDestinoId')) {
      plainObject.carreraDestinoId = this.carreraDestinoId;
    }
    if (this.hasOwnProperty('planEstudioDestinoId')) {
      plainObject.planEstudioDestinoId = this.planEstudioDestinoId;
    }
    if (this.hasOwnProperty('regimenEstudios')) {
      plainObject.regimenEstudios = this.regimenEstudios;
    }
    if (this.hasOwnProperty('aceptaCompromiso')) {
      plainObject.aceptaCompromiso = this.aceptaCompromiso;
    }
    if (this.hasOwnProperty('fechaCompromiso')) {
      plainObject.fechaCompromiso = this.fechaCompromiso;
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

    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}
