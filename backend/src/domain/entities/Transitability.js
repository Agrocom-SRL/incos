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

    if (Object.prototype.hasOwnProperty.call(data, 'estudianteId')) {
      this.estudianteId = data.estudianteId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'codigoRude')) {
      this.codigoRude = data.codigoRude;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'institucionOrigenId')) {
      this.institucionOrigenId = data.institucionOrigenId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'carreraOrigen')) {
      this.carreraOrigen = data.carreraOrigen;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'anioConclusion')) {
      this.anioConclusion = data.anioConclusion;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'regimenEstudios')) {
      this.regimenEstudios = data.regimenEstudios;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'aceptaCompromiso')) {
      this.aceptaCompromiso = data.aceptaCompromiso;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'fechaCompromiso')) {
      this.fechaCompromiso = data.fechaCompromiso;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'estado')) {
      this.estado = data.estado;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'fechaSolicitud')) {
      this.fechaSolicitud = data.fechaSolicitud;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'motivoNoProcedente')) {
      this.motivoNoProcedente = data.motivoNoProcedente;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'observaciones')) {
      this.observaciones = data.observaciones;
    }
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos inicializados, igual que Student.toPlainObject()
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    if (Object.prototype.hasOwnProperty.call(this, 'estudianteId')) {
      plainObject.estudianteId = this.estudianteId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'codigoRude')) {
      plainObject.codigoRude = this.codigoRude;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'institucionOrigenId')) {
      plainObject.institucionOrigenId = this.institucionOrigenId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'carreraOrigen')) {
      plainObject.carreraOrigen = this.carreraOrigen;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'anioConclusion')) {
      plainObject.anioConclusion = this.anioConclusion;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'regimenEstudios')) {
      plainObject.regimenEstudios = this.regimenEstudios;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'aceptaCompromiso')) {
      plainObject.aceptaCompromiso = this.aceptaCompromiso;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'fechaCompromiso')) {
      plainObject.fechaCompromiso = this.fechaCompromiso;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'estado')) {
      plainObject.estado = this.estado;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'fechaSolicitud')) {
      plainObject.fechaSolicitud = this.fechaSolicitud;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'motivoNoProcedente')) {
      plainObject.motivoNoProcedente = this.motivoNoProcedente;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'observaciones')) {
      plainObject.observaciones = this.observaciones;
    }

    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}
