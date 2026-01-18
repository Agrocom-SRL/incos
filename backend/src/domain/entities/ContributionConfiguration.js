import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: ContributionConfiguration
 * Representa la configuración del monto del aporte académico por gestión
 */
export class ContributionConfiguration extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    if (data.hasOwnProperty('managementId')) {
      this.managementId = data.managementId;
    }
    if (data.hasOwnProperty('baseAmount')) {
      this.baseAmount = parseFloat(data.baseAmount) || 400.00;
    } else if (!data.hasOwnProperty('managementId')) {
      this.baseAmount = 400.00;
    }
    if (data.hasOwnProperty('contributionActive')) {
      this.contributionActive = data.contributionActive;
    } else if (!data.hasOwnProperty('managementId')) {
      this.contributionActive = true;
    }
    if (data.hasOwnProperty('startDate')) {
      this.startDate = data.startDate;
    }
    if (data.hasOwnProperty('endDate')) {
      this.endDate = data.endDate;
    }
  }

  /**
   * Verifica si el aporte está activo
   * @returns {boolean}
   */
  isContributionActive() {
    return this.contributionActive === true;
  }

  /**
   * Verifica si el aporte está vigente en una fecha específica
   * @param {Date} date - Fecha a verificar
   * @returns {boolean}
   */
  isActiveOnDate(date = new Date()) {
    if (!this.isContributionActive()) return false;
    const checkDate = date instanceof Date ? date : new Date(date);
    if (this.startDate && new Date(this.startDate) > checkDate) return false;
    if (this.endDate && new Date(this.endDate) < checkDate) return false;
    return true;
  }

  toPlainObject() {
    const plainObject = super.toPlainObject();
    
    if (this.hasOwnProperty('managementId')) {
      plainObject.managementId = this.managementId;
    }
    if (this.hasOwnProperty('baseAmount')) {
      plainObject.baseAmount = this.baseAmount;
    }
    if (this.hasOwnProperty('contributionActive')) {
      plainObject.contributionActive = this.contributionActive;
    }
    if (this.hasOwnProperty('startDate')) {
      plainObject.startDate = this.startDate;
    }
    if (this.hasOwnProperty('endDate')) {
      plainObject.endDate = this.endDate;
    }

    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}
