import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_GESTION_PLAN_VALUES, ESTADOS_GESTION_PLAN } from '../constants/cursos.constants.js';

/**
 * Entidad de Dominio: ManagementPlan
 * Representa la habilitación de planes de estudio por gestión
 * Define qué planes están autorizados para ofertar en cada año académico
 */
export class ManagementPlan extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.managementId = data.managementId || null;
    this.studyPlanId = data.studyPlanId || null;
    this.name = data.name || null;
    this.state = data.state || ESTADOS_GESTION_PLAN.PROPUESTO;
    this.cancellationReason = data.cancellationReason || null;
  }

  /**
   * Valida el estado de habilitación
   * @returns {boolean}
   */
  isValidState() {
    if (!this.state) return false;
    return ESTADOS_GESTION_PLAN_VALUES.includes(this.state);
  }

  /**
   * Verifica si el plan está vigente
   * @returns {boolean}
   */
  isActive() {
    return this.state === ESTADOS_GESTION_PLAN.VIGENTE;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      managementId: this.managementId,
      studyPlanId: this.studyPlanId,
      name: this.name,
      state: this.state,
      cancellationReason: this.cancellationReason,
    };
  }
}
