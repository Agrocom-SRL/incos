import { BaseEntity } from './BaseEntity.js';
import {
  ESTADOS_OFERTA_CURSO,
  ESTADOS_OFERTA_CURSO_VALUES,
} from '../constants/oferta.constants.js';

export class CourseOffer extends BaseEntity {
  constructor(data = {}) {
    super(data);
    if (Object.prototype.hasOwnProperty.call(data, 'parallelManagementId')) {
      this.parallelManagementId = data.parallelManagementId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'planSubjectId')) this.planSubjectId = data.planSubjectId;
    if (Object.prototype.hasOwnProperty.call(data, 'state')) this.state = data.state;
    else if (!Object.prototype.hasOwnProperty.call(data, 'parallelManagementId')) {
      this.state = ESTADOS_OFERTA_CURSO.PROGRAMADA;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'observations')) this.observations = data.observations;
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
