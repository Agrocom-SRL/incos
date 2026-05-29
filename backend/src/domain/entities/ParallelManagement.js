import { BaseEntity } from './BaseEntity.js';
import {
  ESTADOS_PARALELO_GESTION,
  ESTADOS_PARALELO_GESTION_VALUES,
} from '../constants/oferta.constants.js';

export class ParallelManagement extends BaseEntity {
  constructor(data = {}) {
    super(data);
    if (data.hasOwnProperty('managementPlanId')) this.managementPlanId = data.managementPlanId;
    if (data.hasOwnProperty('parallelId')) this.parallelId = data.parallelId;
    if (data.hasOwnProperty('classroomId')) this.classroomId = data.classroomId;
    if (data.hasOwnProperty('shift')) this.shift = data.shift;
    if (data.hasOwnProperty('state')) this.state = data.state;
    else if (!data.hasOwnProperty('managementPlanId')) {
      this.state = ESTADOS_PARALELO_GESTION.BORRADOR;
    }
    if (data.hasOwnProperty('maxCapacity')) this.maxCapacity = data.maxCapacity;
    if (data.hasOwnProperty('minCapacity')) this.minCapacity = data.minCapacity;
    if (data.hasOwnProperty('observations')) this.observations = data.observations;
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
