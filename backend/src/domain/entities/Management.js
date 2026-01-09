import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Management
 * Representa una gestión académica (año académico)
 * Permite múltiples gestiones por año: regular, verano, nivelación, etc.
 */
export class Management extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.code = data.code || null; // Ej: "2025-REG", "2025-VER", "2025-NIV"
    this.name = data.name || null;
    this.year = data.year || null;
    this.type = data.type || 'REGULAR'; // REGULAR, VERANO, INVIERNO, NIVELACION, EXTRAORDINARIA
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.isActive = data.isActive !== undefined ? data.isActive : false;
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
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      code: this.code,
      name: this.name,
      year: this.year,
      type: this.type,
      startDate: this.startDate,
      endDate: this.endDate,
      isActive: this.isActive,
    };
  }
}
