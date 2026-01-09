import { BaseEntity } from './BaseEntity.js';
import { TIPOS_ORIGEN_VALUES, TIPOS_ORIGEN } from '../constants/index.js';

/**
 * Entidad de Dominio: StudentOrigin
 * Representa un origen/nacionalidad de un estudiante
 */
export class StudentOrigin extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.studentId = data.studentId || null;
    this.countryId = data.countryId || null;
    this.birthMunicipalityId = data.birthMunicipalityId || null;
    this.birthCity = data.birthCity || null;
    this.motherTongueId = data.motherTongueId || null;
    this.secondaryLanguageId = data.secondaryLanguageId || null;
    this.originType = data.originType || TIPOS_ORIGEN.BOLIVIANA;
    this.isPrincipal = data.isPrincipal !== undefined ? data.isPrincipal : true;
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

