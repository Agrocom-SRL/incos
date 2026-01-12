import { BaseEntity } from './BaseEntity.js';
import { EXPEDICIONES_CI_VALUES, GENEROS_VALUES } from '../constants/index.js';
import { NIVELES_ACADEMICOS_PERSONAL_VALUES, NIVELES_ACADEMICOS, TIPOS_CONTRATO_DOCENTE_VALUES, TIPOS_CONTRATO_DOCENTE, ESTADOS_LABORALES_VALUES, ESTADOS_LABORALES } from '../constants/docentes.constants.js';

/**
 * Entidad de Dominio: Teacher
 * Representa un docente del instituto
 */
export class Teacher extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.userId = data.userId || null;
    this.ci = data.ci || null;
    this.expedition = data.expedition || null;
    this.firstName = data.firstName || null;
    this.lastName = data.lastName || null;
    this.motherLastName = data.motherLastName || null;
    this.birthDate = data.birthDate || null;
    this.gender = data.gender || null;
    this.civilStatusId = data.civilStatusId || null;
    this.nationality = data.nationality || 'Boliviana';
    this.phone = data.phone || null;
    this.mobilePhone = data.mobilePhone || null;
    this.personalEmail = data.personalEmail || null;
    this.address = data.address || null;
    this.residenceMunicipalityId = data.residenceMunicipalityId || null;
    this.zone = data.zone || null;
    this.professionalTitle = data.professionalTitle || null;
    this.specialty = data.specialty || null;
    this.academicLevel = data.academicLevel || NIVELES_ACADEMICOS.LICENCIATURA;
    this.graduationInstitution = data.graduationInstitution || null;
    this.graduationYear = data.graduationYear || null;
    this.yearsOfExperience = data.yearsOfExperience !== undefined ? data.yearsOfExperience : 0;
    this.hireDate = data.hireDate || null;
    this.retirementDate = data.retirementDate || null;
    this.contractType = data.contractType || TIPOS_CONTRATO_DOCENTE.CONTRATO;
    this.laborState = data.laborState || ESTADOS_LABORALES.ACTIVO;
    this.observations = data.observations || null;
  }

  /**
   * Valida el género
   * @returns {boolean}
   */
  isValidGender() {
    if (!this.gender) return false;
    return GENEROS_VALUES.includes(this.gender);
  }

  /**
   * Obtiene el nombre completo del docente
   * @returns {string}
   */
  getFullName() {
    const parts = [this.firstName, this.lastName];
    if (this.motherLastName) {
      parts.push(this.motherLastName);
    }
    return parts.filter(Boolean).join(' ');
  }

  /**
   * Valida el formato del CI
   * @returns {boolean}
   */
  isValidCI() {
    if (!this.ci) return false;
    return /^\d{7,9}$/.test(this.ci);
  }

  /**
   * Valida el formato de la expedición
   * @returns {boolean}
   */
  isValidExpedition() {
    if (!this.expedition) return false;
    return EXPEDICIONES_CI_VALUES.includes(this.expedition);
  }

  /**
   * Valida el nivel académico
   * @returns {boolean}
   */
  isValidAcademicLevel() {
    if (!this.academicLevel) return false;
    return NIVELES_ACADEMICOS_PERSONAL_VALUES.includes(this.academicLevel);
  }

  /**
   * Valida el tipo de contrato
   * @returns {boolean}
   */
  isValidContractType() {
    if (!this.contractType) return false;
    return TIPOS_CONTRATO_DOCENTE_VALUES.includes(this.contractType);
  }

  /**
   * Valida el estado laboral
   * @returns {boolean}
   */
  isValidLaborState() {
    if (!this.laborState) return false;
    return ESTADOS_LABORALES_VALUES.includes(this.laborState);
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      userId: this.userId,
      ci: this.ci,
      expedition: this.expedition,
      firstName: this.firstName,
      lastName: this.lastName,
      motherLastName: this.motherLastName,
      birthDate: this.birthDate,
      gender: this.gender,
      civilStatusId: this.civilStatusId,
      nationality: this.nationality,
      phone: this.phone,
      mobilePhone: this.mobilePhone,
      personalEmail: this.personalEmail,
      address: this.address,
      residenceMunicipalityId: this.residenceMunicipalityId,
      zone: this.zone,
      professionalTitle: this.professionalTitle,
      specialty: this.specialty,
      academicLevel: this.academicLevel,
      graduationInstitution: this.graduationInstitution,
      graduationYear: this.graduationYear,
      yearsOfExperience: this.yearsOfExperience,
      hireDate: this.hireDate,
      retirementDate: this.retirementDate,
      contractType: this.contractType,
      laborState: this.laborState,
      observations: this.observations,
    };
  }
}
