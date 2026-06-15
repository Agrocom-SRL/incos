import { BaseEntity } from './BaseEntity.js';
import {
  ESTADOS_OFERTA_CURSO,
  ESTADOS_OFERTA_CURSO_VALUES,
} from '../constants/oferta.constants.js';

export class CourseOffer extends BaseEntity {
  constructor(data = {}) {
    super(data);
    if (data.hasOwnProperty('parallelManagementId')) {
      this.parallelManagementId = data.parallelManagementId;
    }
    if (data.hasOwnProperty('planSubjectId')) this.planSubjectId = data.planSubjectId;
    if (data.hasOwnProperty('state')) this.state = data.state;
    else if (!data.hasOwnProperty('parallelManagementId')) {
      this.state = ESTADOS_OFERTA_CURSO.PROGRAMADA;
    }
    if (data.hasOwnProperty('observations')) this.observations = data.observations;
  }

  isValidState() {
    return this.state && ESTADOS_OFERTA_CURSO_VALUES.includes(this.state);
  }

  toPlainObject() {
    return {
      ...super.toPlainObject(),
      parallelManagementId: this.parallelManagementId,
      planSubjectId: this.planSubjectId,
      state: this.state,
      observations: this.observations,
    };
  }
}
