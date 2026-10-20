import { BaseEntity } from './BaseEntity.js';
import { TIPOS_BECA_AUTOMATICA_VALUES, TIPOS_BECA_AUTOMATICA } from '../constants/index.js';

/**
 * Entidad de Dominio: Scholarship
 * Representa una beca o descuento disponible
 */
export class Scholarship extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'name')) {
      this.name = data.name;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'code')) {
      this.code = data.code;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'percentage')) {
      this.percentage = data.percentage;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'description')) {
      this.description = data.description;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'requiresDocumentation')) {
      this.requiresDocumentation = data.requiresDocumentation;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.requiresDocumentation = true;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'requiresRectorApproval')) {
      this.requiresRectorApproval = data.requiresRectorApproval;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.requiresRectorApproval = false;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'isAutomatic')) {
      this.isAutomatic = data.isAutomatic;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.isAutomatic = false;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'automaticType')) {
      this.automaticType = data.automaticType;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.automaticType = TIPOS_BECA_AUTOMATICA.MANUAL;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'minimumAverage')) {
      this.minimumAverage = data.minimumAverage;
    }
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
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (Object.prototype.hasOwnProperty.call(this, 'name')) {
      plainObject.name = this.name;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'code')) {
      plainObject.code = this.code;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'percentage')) {
      plainObject.percentage = this.percentage;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'description')) {
      plainObject.description = this.description;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'requiresDocumentation')) {
      plainObject.requiresDocumentation = this.requiresDocumentation;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'requiresRectorApproval')) {
      plainObject.requiresRectorApproval = this.requiresRectorApproval;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'isAutomatic')) {
      plainObject.isAutomatic = this.isAutomatic;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'automaticType')) {
      plainObject.automaticType = this.automaticType;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'minimumAverage')) {
      plainObject.minimumAverage = this.minimumAverage;
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
