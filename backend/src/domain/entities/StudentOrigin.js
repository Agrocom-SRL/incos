import { BaseEntity } from './BaseEntity.js';

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
    this.originType = data.originType || 'BOLIVIANA'; // BOLIVIANA, EXTRANJERA, DOBLE_NACIONALIDAD
    this.isPrincipal = data.isPrincipal !== undefined ? data.isPrincipal : true;
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

