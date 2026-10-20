import { BaseEntity } from './BaseEntity.js';
import { TIPOS_CONFIGURACION_VALUES, TIPOS_CONFIGURACION } from '../constants/index.js';

/**
 * Entidad de Dominio: SystemConfiguration
 * Representa una configuración del sistema.
 * Contiene la lógica de negocio pura del par clave/valor tipado.
 *
 * Mapeo con BD (tabla configuracion_sistema, 03-catalogos-referencia.sql):
 * - key ← clave, value ← valor, type ← tipo, description ← descripcion
 */
export class SystemConfiguration extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'key')) {
      this.key = data.key;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'value')) {
      this.value = data.value;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'type')) {
      this.type = data.type;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'key')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.type = TIPOS_CONFIGURACION.STRING;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'description')) {
      this.description = data.description;
    }
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
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (Object.prototype.hasOwnProperty.call(this, 'key')) {
      plainObject.key = this.key;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'value')) {
      plainObject.value = this.value;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'type')) {
      plainObject.type = this.type;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'description')) {
      plainObject.description = this.description;
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
