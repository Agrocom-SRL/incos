import { BaseEntity } from './BaseEntity.js';
import { TIPOS_ETAPA_GESTION_VALUES } from '../../shared/constants/index.js';

/**
 * Entidad de Dominio: ManagementStage
 * Representa una etapa de una gestión académica
 */
export class ManagementStage extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.managementId = data.managementId || null;
    this.name = data.name || null;
    this.type = data.type || null; // PRE_INSCRIPCION, INSCRIPCIONES, CLASES, etc.
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.isActive = data.isActive !== undefined ? data.isActive : false;
    this.description = data.description || null;
  }

  /**
   * Valida el tipo de etapa
   * @returns {boolean}
   */
  isValidType() {
    if (!this.type) return false;
    return TIPOS_ETAPA_GESTION_VALUES.includes(this.type);
  }

  /**
   * Verifica si la etapa está vigente
   * @returns {boolean}
   */
  isCurrentlyActive() {
    if (!this.isActive) return false;
    if (!this.startDate) return false;
    const today = new Date();
    const start = new Date(this.startDate);
    if (today < start) return false;
    if (this.endDate) {
      const end = new Date(this.endDate);
      return today <= end;
    }
    return true;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      managementId: this.managementId,
      name: this.name,
      type: this.type,
      startDate: this.startDate,
      endDate: this.endDate,
      isActive: this.isActive,
      description: this.description,
    };
  }
}
