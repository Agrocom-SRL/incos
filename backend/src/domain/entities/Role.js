import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Role
 * Representa un rol del sistema.
 * Contiene la lógica de negocio pura del rol (nivel de acceso).
 *
 * Mapeo con BD (tabla roles, 04-sistema-seguridad.sql):
 * - code ← codigo, name ← nombre, accessLevel ← nivel_acceso
 */
export class Role extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('code')) {
      this.code = data.code;
    }
    if (data.hasOwnProperty('name')) {
      this.name = data.name;
    }
    if (data.hasOwnProperty('accessLevel')) {
      this.accessLevel = data.accessLevel;
    } else if (!data.hasOwnProperty('code')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.accessLevel = 1;
    }
  }

  /**
   * Valida que el nivel de acceso esté en el rango válido (1-5)
   * @returns {boolean}
   */
  isValidAccessLevel() {
    return this.accessLevel >= 1 && this.accessLevel <= 5;
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();
    
    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('code')) {
      plainObject.code = this.code;
    }
    if (this.hasOwnProperty('name')) {
      plainObject.name = this.name;
    }
    if (this.hasOwnProperty('accessLevel')) {
      plainObject.accessLevel = this.accessLevel;
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
