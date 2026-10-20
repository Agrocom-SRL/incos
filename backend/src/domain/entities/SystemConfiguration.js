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
    if (data.hasOwnProperty('key')) {
      this.key = data.key;
    }
    if (data.hasOwnProperty('value')) {
      this.value = data.value;
    }
    if (data.hasOwnProperty('type')) {
      this.type = data.type;
    } else if (!data.hasOwnProperty('key')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.type = TIPOS_CONFIGURACION.STRING;
    }
    if (data.hasOwnProperty('description')) {
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
    if (this.hasOwnProperty('key')) {
      plainObject.key = this.key;
    }
    if (this.hasOwnProperty('value')) {
      plainObject.value = this.value;
    }
    if (this.hasOwnProperty('type')) {
      plainObject.type = this.type;
    }
    if (this.hasOwnProperty('description')) {
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
