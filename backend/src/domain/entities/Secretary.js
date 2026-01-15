import { BaseEntity } from './BaseEntity.js';
import { NIVELES_ACADEMICOS_VALUES, NIVELES_ACADEMICOS, TIPOS_SECRETARIA_VALUES, TIPOS_SECRETARIA, TIPOS_CONTRATO_SECRETARIA_VALUES, TIPOS_CONTRATO_SECRETARIA } from '../constants/index.js';

/**
 * Entidad de Dominio: Secretary
 * Representa una secretaria del instituto
 */
export class Secretary extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('staffId')) {
      this.staffId = data.staffId;
    }
    if (data.hasOwnProperty('type')) {
      this.type = data.type; // ACADEMICA, ADMINISTRATIVA
    }
    if (data.hasOwnProperty('academicLevel')) {
      this.academicLevel = data.academicLevel;
    }
    if (data.hasOwnProperty('hireDate')) {
      this.hireDate = data.hireDate;
    }
    if (data.hasOwnProperty('contractEndDate')) {
      this.contractEndDate = data.contractEndDate;
    }
    if (data.hasOwnProperty('contractType')) {
      this.contractType = data.contractType; // EVENTUAL, TEMPORAL, INDEFINIDO
    }
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
    return this.type === TIPOS_SECRETARIA.ACADEMICA;
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
