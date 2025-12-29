/**
 * Entidad Base para el Frontend
 * Factoriza atributos y métodos comunes de todas las entidades
 * 
 * Clean Architecture:
 * - Domain Layer: Entidad base con lógica común
 * 
 * NOTA: Las entidades del frontend son más simples que las del backend,
 * pero aún así comparten métodos comunes como validación y transformación.
 */

export class BaseEntity {
  constructor(data = {}) {
    // Atributos comunes
    this.id = data.id || null;
    this.active = data.active !== undefined ? data.active : (data.activa !== undefined ? data.activa : true);
    this.createdAt = data.createdAt || data.created_at || null;
    this.updatedAt = data.updatedAt || data.updated_at || null;
  }

  /**
   * Verifica si la entidad está activa
   * @returns {boolean}
   */
  isActive() {
    return this.active === true || this.activa === true;
  }

  /**
   * Convierte la entidad a objeto plano para enviar al backend
   * @param {boolean} includeNulls - Si incluir campos null/undefined
   * @returns {Object}
   */
  toPlainObject(includeNulls = true) {
    const plain = {
      id: this.id,
      active: this.active !== undefined ? this.active : (this.activa !== undefined ? this.activa : true),
    };

    // Solo incluir campos si no son null/undefined o si se especifica incluir nulls
    Object.keys(this).forEach(key => {
      if (key === 'id' || key === 'active' || key === 'activa') return;
      
      const value = this[key];
      if (includeNulls || (value !== null && value !== undefined && value !== '')) {
        plain[key] = value;
      }
    });

    return plain;
  }

  /**
   * Valida que el ID exista
   * @returns {boolean}
   */
  hasId() {
    return this.id !== null && this.id !== undefined;
  }
}

