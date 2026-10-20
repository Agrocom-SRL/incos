import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Period
 * Representa un periodo (año académico) de un plan de estudios
 * Ejemplo: 1º Año, 2º Año, 3º Año
 */
export class Period extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('studyPlanId')) {
      this.studyPlanId = data.studyPlanId;
    }
    if (data.hasOwnProperty('name')) {
      this.name = data.name;
    }
    if (data.hasOwnProperty('number')) {
      this.number = data.number;
    }
    if (data.hasOwnProperty('displayOrder')) {
      this.displayOrder = data.displayOrder;
    } else if (!data.hasOwnProperty('studyPlanId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.displayOrder = 1;
    }
    if (data.hasOwnProperty('description')) {
      this.description = data.description;
    }
  }

  /**
   * Valida que el número del periodo sea positivo
   * @returns {boolean}
   */
  isValidNumber() {
    return this.number > 0;
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('studyPlanId')) {
      plainObject.studyPlanId = this.studyPlanId;
    }
    if (this.hasOwnProperty('name')) {
      plainObject.name = this.name;
    }
    if (this.hasOwnProperty('number')) {
      plainObject.number = this.number;
    }
    if (this.hasOwnProperty('displayOrder')) {
      plainObject.displayOrder = this.displayOrder;
    }
    if (this.hasOwnProperty('description')) {
      plainObject.description = this.description;
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
