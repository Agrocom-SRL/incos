import { BaseEntity } from './BaseEntity.js';
import {
  ESTADOS_PARALELO_GESTION,
  ESTADOS_PARALELO_GESTION_VALUES,
} from '../constants/oferta.constants.js';

export class ParallelManagement extends BaseEntity {
  constructor(data = {}) {
    super(data);
    if (Object.prototype.hasOwnProperty.call(data, 'managementPlanId')) this.managementPlanId = data.managementPlanId;
    if (Object.prototype.hasOwnProperty.call(data, 'parallelId')) this.parallelId = data.parallelId;
    if (Object.prototype.hasOwnProperty.call(data, 'classroomId')) this.classroomId = data.classroomId;
    if (Object.prototype.hasOwnProperty.call(data, 'shift')) this.shift = data.shift;
    if (Object.prototype.hasOwnProperty.call(data, 'state')) this.state = data.state;
    else if (!Object.prototype.hasOwnProperty.call(data, 'managementPlanId')) {
      this.state = ESTADOS_PARALELO_GESTION.BORRADOR;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'maxCapacity')) this.maxCapacity = data.maxCapacity;
    if (Object.prototype.hasOwnProperty.call(data, 'minCapacity')) this.minCapacity = data.minCapacity;
    if (Object.prototype.hasOwnProperty.call(data, 'observations')) this.observations = data.observations;
  }

  isValidState() {
    return this.state && ESTADOS_PARALELO_GESTION_VALUES.includes(this.state);
  }

  toPlainObject() {
    return {
      ...super.toPlainObject(),
      managementPlanId: this.managementPlanId,
      parallelId: this.parallelId,
      classroomId: this.classroomId,
      shift: this.shift,
      state: this.state,
      maxCapacity: this.maxCapacity,
      minCapacity: this.minCapacity,
      observations: this.observations,
    };
  }
}
