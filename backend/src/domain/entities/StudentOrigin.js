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
    if (data.hasOwnProperty('studentId')) {
      this.studentId = data.studentId;
    }
    if (data.hasOwnProperty('countryId')) {
      this.countryId = data.countryId;
    }
    if (data.hasOwnProperty('birthMunicipalityId')) {
      this.birthMunicipalityId = data.birthMunicipalityId;
    }
    if (data.hasOwnProperty('birthCity')) {
      this.birthCity = data.birthCity;
    }
    if (data.hasOwnProperty('motherTongueId')) {
      this.motherTongueId = data.motherTongueId;
    }
    if (data.hasOwnProperty('secondaryLanguageId')) {
      this.secondaryLanguageId = data.secondaryLanguageId;
    }
    if (data.hasOwnProperty('originType')) {
      this.originType = data.originType;
    } else if (!data.hasOwnProperty('studentId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.originType = TIPOS_ORIGEN.BOLIVIANA;
    }
    if (data.hasOwnProperty('isPrincipal')) {
      this.isPrincipal = data.isPrincipal;
    } else if (!data.hasOwnProperty('studentId')) {
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

