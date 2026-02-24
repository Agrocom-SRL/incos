import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de dominio: Institution
 * Representa una institución educativa (UETHP, CEA, ITT, etc.).
 * Basada en el schema de la tabla instituciones.
 */
export class Institution extends BaseEntity {
  constructor(data = {}) {
    super(data);

    if (data.hasOwnProperty('nombre')) {
      this.nombre = data.nombre;
    }
    if (data.hasOwnProperty('sigla')) {
      this.sigla = data.sigla;
    }
    if (data.hasOwnProperty('tipo')) {
      this.tipo = data.tipo;
    }
    if (data.hasOwnProperty('dependencia')) {
      this.dependencia = data.dependencia;
    }
    if (data.hasOwnProperty('codigoSie')) {
      this.codigoSie = data.codigoSie;
    }
    if (data.hasOwnProperty('departamentoId')) {
      this.departamentoId = data.departamentoId;
    }
    if (data.hasOwnProperty('distritoEducativo')) {
      this.distritoEducativo = data.distritoEducativo;
    }
  }

  toPlainObject() {
    const plainObject = super.toPlainObject();

    if (this.hasOwnProperty('nombre')) {
      plainObject.nombre = this.nombre;
    }
    if (this.hasOwnProperty('sigla')) {
      plainObject.sigla = this.sigla;
    }
    if (this.hasOwnProperty('tipo')) {
      plainObject.tipo = this.tipo;
    }
    if (this.hasOwnProperty('dependencia')) {
      plainObject.dependencia = this.dependencia;
    }
    if (this.hasOwnProperty('codigoSie')) {
      plainObject.codigoSie = this.codigoSie;
    }
    if (this.hasOwnProperty('departamentoId')) {
      plainObject.departamentoId = this.departamentoId;
    }
    if (this.hasOwnProperty('distritoEducativo')) {
      plainObject.distritoEducativo = this.distritoEducativo;
    }

    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}

