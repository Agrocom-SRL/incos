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
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'managementId')) {
      this.managementId = data.managementId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'studyPlanId')) {
      this.studyPlanId = data.studyPlanId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'name')) {
      this.name = data.name;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'state')) {
      this.state = data.state;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'managementId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.state = ESTADOS_GESTION_PLAN.PROPUESTO;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'cancellationReason')) {
      this.cancellationReason = data.cancellationReason;
    }
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
