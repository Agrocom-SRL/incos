import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de dominio: Institution
 * Representa una institución educativa (UETHP, CEA, ITT, etc.).
 * Basada en el schema de la tabla instituciones.
 */
export class Institution extends BaseEntity {
  constructor(data = {}) {
    super(data);

    if (Object.prototype.hasOwnProperty.call(data, 'nombre')) {
      this.nombre = data.nombre;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'tipo')) {
      this.tipo = data.tipo;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'dependencia')) {
      this.dependencia = data.dependencia;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'codigoSie')) {
      this.codigoSie = data.codigoSie;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'departamentoId')) {
      this.departamentoId = data.departamentoId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'distritoEducativo')) {
      this.distritoEducativo = data.distritoEducativo;
    }
  }

  toPlainObject() {
    const plainObject = super.toPlainObject();

    if (Object.prototype.hasOwnProperty.call(this, 'nombre')) {
      plainObject.nombre = this.nombre;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'tipo')) {
      plainObject.tipo = this.tipo;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'dependencia')) {
      plainObject.dependencia = this.dependencia;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'codigoSie')) {
      plainObject.codigoSie = this.codigoSie;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'departamentoId')) {
      plainObject.departamentoId = this.departamentoId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'distritoEducativo')) {
      plainObject.distritoEducativo = this.distritoEducativo;
    }

    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}
