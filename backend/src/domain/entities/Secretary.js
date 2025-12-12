import { BaseEntity } from './BaseEntity.js';
import { NIVELES_ACADEMICOS_VALUES, TIPOS_SECRETARIA_VALUES, TIPOS_CONTRATO_SECRETARIA_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: Secretary
 * Representa una secretaria del instituto
 */
export class Secretary extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.staffId = data.staffId || null;
    this.type = data.type || null; // ACADEMICA, ADMINISTRATIVA
    this.academicLevel = data.academicLevel || null;
    this.hireDate = data.hireDate || null;
    this.contractEndDate = data.contractEndDate || null;
    this.contractType = data.contractType || null; // EVENTUAL, TEMPORAL, INDEFINIDO
  }

  /**
   * Valida el tipo de secretaria
   * @returns {boolean}
   */
  isValidType() {
    if (!this.type) return false;
    return TIPOS_SECRETARIA_VALUES.includes(this.type);
  }

  /**
   * Valida el nivel académico
   * @returns {boolean}
   */
  isValidAcademicLevel() {
    if (!this.academicLevel) return true; // Opcional
    return NIVELES_ACADEMICOS_VALUES.includes(this.academicLevel);
  }

  /**
   * Valida el tipo de contrato
   * @returns {boolean}
   */
  isValidContractType() {
    if (!this.contractType) return true; // Opcional
    return TIPOS_CONTRATO_SECRETARIA_VALUES.includes(this.contractType);
  }

  /**
   * Verifica si es secretaria académica
   * @returns {boolean}
   */
  isAcademic() {
    return this.type === 'ACADEMICA';
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      staffId: this.staffId,
      type: this.type,
      academicLevel: this.academicLevel,
      hireDate: this.hireDate,
      contractEndDate: this.contractEndDate,
      contractType: this.contractType,
    };
  }
}
