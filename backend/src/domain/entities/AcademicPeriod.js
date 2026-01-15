import { BaseEntity } from './BaseEntity.js';
import { DIVISIONES_PERIODO_ACADEMICO_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: AcademicPeriod
 * Representa un periodo académico temporal dentro de una gestión
 * Ejemplo: Planificación, Primer Bimestre, Segundo Bimestre, Clausura
 */
export class AcademicPeriod extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('managementId')) {
      this.managementId = data.managementId;
    }
    if (data.hasOwnProperty('code')) {
      this.code = data.code; // Ej: "2025-PLAN", "2025-BIM1", "2025-CLAU"
    }
    if (data.hasOwnProperty('name')) {
      this.name = data.name;
    }
    if (data.hasOwnProperty('division')) {
      this.division = data.division; // PLANIFICACION, MENSUAL, BIMESTRE, TRIMESTRE, CUATRIMESTRE, SEMESTRE, CLAUSURA, OTRO
    }
    if (data.hasOwnProperty('orderNumber')) {
      this.orderNumber = data.orderNumber;
    }
    if (data.hasOwnProperty('startDate')) {
      this.startDate = data.startDate;
    }
    if (data.hasOwnProperty('endDate')) {
      this.endDate = data.endDate;
    }
    if (data.hasOwnProperty('colorHex')) {
      this.colorHex = data.colorHex;
    }
  }

  /**
   * Valida el tipo de división
   * @returns {boolean}
   */
  isValidDivision() {
    if (!this.division) return false;
    return DIVISIONES_PERIODO_ACADEMICO_VALUES.includes(this.division);
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
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();
    
    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('managementId')) {
      plainObject.managementId = this.managementId;
    }
    if (this.hasOwnProperty('code')) {
      plainObject.code = this.code;
    }
    if (this.hasOwnProperty('name')) {
      plainObject.name = this.name;
    }
    if (this.hasOwnProperty('division')) {
      plainObject.division = this.division;
    }
    if (this.hasOwnProperty('orderNumber')) {
      plainObject.orderNumber = this.orderNumber;
    }
    if (this.hasOwnProperty('startDate')) {
      plainObject.startDate = this.startDate;
    }
    if (this.hasOwnProperty('endDate')) {
      plainObject.endDate = this.endDate;
    }
    if (this.hasOwnProperty('colorHex')) {
      plainObject.colorHex = this.colorHex;
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
