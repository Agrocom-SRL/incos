import { BaseEntity } from './BaseEntity.js';
import { TIPOS_BECA_AUTOMATICA_VALUES, TIPOS_BECA_AUTOMATICA } from '../constants/index.js';

/**
 * Entidad de Dominio: Scholarship
 * Representa una beca o descuento disponible
 */
export class Scholarship extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.name = data.name || null;
    this.code = data.code || null;
    this.percentage = data.percentage !== undefined ? data.percentage : null;
    this.description = data.description || null;
    this.requiresDocumentation = data.requiresDocumentation !== undefined ? data.requiresDocumentation : true;
    this.requiresRectorApproval = data.requiresRectorApproval !== undefined ? data.requiresRectorApproval : false;
    this.isAutomatic = data.isAutomatic !== undefined ? data.isAutomatic : false;
    this.automaticType = data.automaticType || TIPOS_BECA_AUTOMATICA.MANUAL;
    this.minimumAverage = data.minimumAverage || null;
  }

  /**
   * Valida que el porcentaje esté en el rango válido (0-100)
   * @returns {boolean}
   */
  isValidPercentage() {
    if (this.percentage === null || this.percentage === undefined) return false;
    return this.percentage >= 0 && this.percentage <= 100;
  }

  /**
   * Verifica si es beca del 100%
   * @returns {boolean}
   */
  isFullScholarship() {
    return this.percentage === 100;
  }

  /**
   * Valida el tipo de asignación automática
   * @returns {boolean}
   */
  isValidAutomaticType() {
    if (!this.automaticType) return false;
    return TIPOS_BECA_AUTOMATICA_VALUES.includes(this.automaticType);
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      name: this.name,
      code: this.code,
      percentage: this.percentage,
      description: this.description,
      requiresDocumentation: this.requiresDocumentation,
      requiresRectorApproval: this.requiresRectorApproval,
      isAutomatic: this.isAutomatic,
      automaticType: this.automaticType,
      minimumAverage: this.minimumAverage,
    };
  }
}
