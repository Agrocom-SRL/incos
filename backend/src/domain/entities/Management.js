import { BaseEntity } from './BaseEntity.js';
import { TIPOS_GESTION_VALUES, TIPOS_GESTION } from '../constants/index.js';

/**
 * Entidad de Dominio: Management
 * Representa una gestión académica (año académico)
 * Permite múltiples gestiones por año: regular, verano, nivelación, etc.
 */
export class Management extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'code')) {
      this.code = data.code;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'name')) {
      this.name = data.name;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'year')) {
      this.year = data.year;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'type')) {
      this.type = data.type;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'code')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.type = TIPOS_GESTION.REGULAR;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'startDate')) {
      this.startDate = data.startDate;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'endDate')) {
      this.endDate = data.endDate;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'vigente')) {
      this.vigente = data.vigente;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'code')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.vigente = false;
    }
  }

  /**
   * Valida el tipo de gestión
   * @returns {boolean}
   */
  isValidType() {
    if (!this.type) return false;
    return TIPOS_GESTION_VALUES.includes(this.type);
  }

  /**
   * Valida el formato del código de gestión
   * @returns {boolean}
   */
  isValidCode() {
    if (!this.code) return false;
    // Formato: YYYY-TIPO (ej: 2025-REG, 2025-VER)
    return /^\d{4}-[A-Z]{3,}$/.test(this.code);
  }

  /**
   * Verifica si la gestión está vigente
   * @returns {boolean}
   */
  isVigente() {
    return this.vigente === true;
  }

  /**
   * Verifica si la gestión está activa según las fechas
   * @returns {boolean}
   */
  isCurrentlyActive() {
    if (!this.startDate || !this.endDate) return false;
    const today = new Date();
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    return today >= start && today <= end;
  }

  /**
   * Extrae el año del código
   * @returns {number|null}
   */
  getYearFromCode() {
    if (!this.code) return null;
    const match = this.code.match(/^(\d{4})-/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (Object.prototype.hasOwnProperty.call(this, 'code')) {
      plainObject.code = this.code;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'name')) {
      plainObject.name = this.name;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'year')) {
      plainObject.year = this.year;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'type')) {
      plainObject.type = this.type;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'startDate')) {
      plainObject.startDate = this.startDate;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'endDate')) {
      plainObject.endDate = this.endDate;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'vigente')) {
      plainObject.vigente = this.vigente;
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
