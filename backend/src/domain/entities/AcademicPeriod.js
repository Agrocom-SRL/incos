import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: AcademicPeriod
 * Representa un periodo académico temporal dentro de una gestión
 * Ejemplo: Planificación, Primer Bimestre, Segundo Bimestre, Clausura
 */
export class AcademicPeriod extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.managementId = data.managementId || null;
    this.code = data.code || null; // Ej: "2025-PLAN", "2025-BIM1", "2025-CLAU"
    this.name = data.name || null;
    this.division = data.division || null; // PLANIFICACION, MENSUAL, BIMESTRE, TRIMESTRE, CUATRIMESTRE, SEMESTRE, CLAUSURA, OTRO
    this.orderNumber = data.orderNumber || null;
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.colorHex = data.colorHex || null;
  }

  /**
   * Valida el tipo de división
   * @returns {boolean}
   */
  isValidDivision() {
    if (!this.division) return false;
    const validDivisions = [
      'PLANIFICACION',
      'MENSUAL',
      'BIMESTRE',
      'TRIMESTRE',
      'CUATRIMESTRE',
      'SEMESTRE',
      'CLAUSURA',
      'OTRO',
    ];
    return validDivisions.includes(this.division);
  }

  /**
   * Valida el formato del color hexadecimal
   * @returns {boolean}
   */
  isValidColorHex() {
    if (!this.colorHex) return true; // Opcional
    return /^#[0-9A-F]{6}$/i.test(this.colorHex);
  }

  /**
   * Verifica si el periodo está vigente según las fechas
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
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      managementId: this.managementId,
      code: this.code,
      name: this.name,
      division: this.division,
      orderNumber: this.orderNumber,
      startDate: this.startDate,
      endDate: this.endDate,
      colorHex: this.colorHex,
    };
  }
}
