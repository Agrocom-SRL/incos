import { BaseEntity } from './BaseEntity.js';
import { TIPOS_CONFIGURACION_VALUES, TIPOS_CONFIGURACION } from '../constants/index.js';

/**
 * Entidad de Dominio: SystemConfiguration
 * Representa una configuración del sistema
 */
export class SystemConfiguration extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.key = data.key || null;
    this.value = data.value || null;
    this.type = data.type || TIPOS_CONFIGURACION.STRING;
    this.description = data.description || null;
  }

  /**
   * Valida el tipo de configuración
   * @returns {boolean}
   */
  isValidType() {
    if (!this.type) return false;
    return TIPOS_CONFIGURACION_VALUES.includes(this.type);
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      key: this.key,
      value: this.value,
      type: this.type,
      description: this.description,
    };
  }
}

