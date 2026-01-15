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
    if (data.hasOwnProperty('name')) {
      this.name = data.name;
    }
    if (data.hasOwnProperty('code')) {
      this.code = data.code;
    }
    if (data.hasOwnProperty('percentage')) {
      this.percentage = data.percentage;
    }
    if (data.hasOwnProperty('description')) {
      this.description = data.description;
    }
    if (data.hasOwnProperty('requiresDocumentation')) {
      this.requiresDocumentation = data.requiresDocumentation;
    } else if (!data.hasOwnProperty('name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.requiresDocumentation = true;
    }
    if (data.hasOwnProperty('requiresRectorApproval')) {
      this.requiresRectorApproval = data.requiresRectorApproval;
    } else if (!data.hasOwnProperty('name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.requiresRectorApproval = false;
    }
    if (data.hasOwnProperty('isAutomatic')) {
      this.isAutomatic = data.isAutomatic;
    } else if (!data.hasOwnProperty('name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.isAutomatic = false;
    }
    if (data.hasOwnProperty('automaticType')) {
      this.automaticType = data.automaticType;
    } else if (!data.hasOwnProperty('name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.automaticType = TIPOS_BECA_AUTOMATICA.MANUAL;
    }
    if (data.hasOwnProperty('minimumAverage')) {
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
    if (this.hasOwnProperty('name')) {
      plainObject.name = this.name;
    }
    if (this.hasOwnProperty('code')) {
      plainObject.code = this.code;
    }
    if (this.hasOwnProperty('percentage')) {
      plainObject.percentage = this.percentage;
    }
    if (this.hasOwnProperty('description')) {
      plainObject.description = this.description;
    }
    if (this.hasOwnProperty('requiresDocumentation')) {
      plainObject.requiresDocumentation = this.requiresDocumentation;
    }
    if (this.hasOwnProperty('requiresRectorApproval')) {
      plainObject.requiresRectorApproval = this.requiresRectorApproval;
    }
    if (this.hasOwnProperty('isAutomatic')) {
      plainObject.isAutomatic = this.isAutomatic;
    }
    if (this.hasOwnProperty('automaticType')) {
      plainObject.automaticType = this.automaticType;
    }
    if (this.hasOwnProperty('minimumAverage')) {
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
