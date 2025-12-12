import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Management
 * Representa una gestión académica (año académico)
 */
export class Management extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.code = data.code || null; // Ej: "2025-1", "2025-2"
    this.year = data.year || null;
    this.promotionImageUrl = data.promotionImageUrl || null;
    this.administrativeStartDate = data.administrativeStartDate || null;
    this.administrativeEndDate = data.administrativeEndDate || null;
  }

  /**
   * Valida el formato del código de gestión
   * @returns {boolean}
   */
  isValidCode() {
    if (!this.code) return false;
    // Formato: YYYY-N (ej: 2025-1)
    return /^\d{4}-\d{1,2}$/.test(this.code);
  }

  /**
   * Verifica si la gestión está activa según las fechas
   * @returns {boolean}
   */
  isCurrentlyActive() {
    if (!this.administrativeStartDate || !this.administrativeEndDate) return false;
    const today = new Date();
    const start = new Date(this.administrativeStartDate);
    const end = new Date(this.administrativeEndDate);
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
      year: this.year,
      promotionImageUrl: this.promotionImageUrl,
      administrativeStartDate: this.administrativeStartDate,
      administrativeEndDate: this.administrativeEndDate,
    };
  }
}
