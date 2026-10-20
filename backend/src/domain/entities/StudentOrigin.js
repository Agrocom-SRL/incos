import { BaseEntity } from './BaseEntity.js';
import { TIPOS_ORIGEN_VALUES, TIPOS_ORIGEN } from '../constants/index.js';

/**
 * Entidad de Dominio: StudentOrigin
 * Representa un origen/nacionalidad de un estudiante
 */
export class StudentOrigin extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      this.studentId = data.studentId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'countryId')) {
      this.countryId = data.countryId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'birthMunicipalityId')) {
      this.birthMunicipalityId = data.birthMunicipalityId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'birthCity')) {
      this.birthCity = data.birthCity;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'motherTongueId')) {
      this.motherTongueId = data.motherTongueId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'secondaryLanguageId')) {
      this.secondaryLanguageId = data.secondaryLanguageId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'originType')) {
      this.originType = data.originType;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.originType = TIPOS_ORIGEN.BOLIVIANA;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'isPrincipal')) {
      this.isPrincipal = data.isPrincipal;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.isPrincipal = true;
    }
  }

  /**
   * Valida el tipo de origen
   * @returns {boolean}
   */
  isValidOriginType() {
    if (!this.originType) return false;
    return TIPOS_ORIGEN_VALUES.includes(this.originType);
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      studentId: this.studentId,
      countryId: this.countryId,
      birthMunicipalityId: this.birthMunicipalityId,
      birthCity: this.birthCity,
      motherTongueId: this.motherTongueId,
      secondaryLanguageId: this.secondaryLanguageId,
      originType: this.originType,
      isPrincipal: this.isPrincipal,
    };
  }
}
