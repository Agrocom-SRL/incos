import { BaseEntity } from './BaseEntity.js';
import { COMPONENTES_EVALUACION_VALUES } from '../constants/evaluaciones.constants.js';

/**
 * Domain Entity: BimesterEvaluation
 * Evaluación dentro de un bimestre (tabla evaluaciones).
 */
export class BimesterEvaluation extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (data.hasOwnProperty('subjectEnrollmentBimesterId')) {
            this.subjectEnrollmentBimesterId = data.subjectEnrollmentBimesterId;
        }
        if (data.hasOwnProperty('evaluationTypeId')) {
            this.evaluationTypeId = data.evaluationTypeId;
        }
        if (data.hasOwnProperty('component')) {
            this.component = data.component;
        }
        if (data.hasOwnProperty('evaluationName')) {
            this.evaluationName = data.evaluationName;
        }
        if (data.hasOwnProperty('description')) {
            this.description = data.description;
        }
        if (data.hasOwnProperty('grade')) {
            this.grade = data.grade;
        }
        if (data.hasOwnProperty('weight')) {
            this.weight = data.weight;
        }
        if (data.hasOwnProperty('date')) {
            this.date = data.date;
        }
        if (data.hasOwnProperty('attempt')) {
            this.attempt = data.attempt;
        }
        if (data.hasOwnProperty('gradesClosed')) {
            this.gradesClosed = data.gradesClosed;
        }
        if (data.hasOwnProperty('gradesClosedAt')) {
            this.gradesClosedAt = data.gradesClosedAt;
        }
        if (data.hasOwnProperty('closedBy')) {
            this.closedBy = data.closedBy;
        }
        if (data.hasOwnProperty('observations')) {
            this.observations = data.observations;
        }
    }

    isValidComponent() {
        if (!this.component) return false;
        return COMPONENTES_EVALUACION_VALUES.includes(this.component);
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (this.hasOwnProperty('subjectEnrollmentBimesterId')) {
            plainObject.subjectEnrollmentBimesterId = this.subjectEnrollmentBimesterId;
        }
        if (this.hasOwnProperty('evaluationTypeId')) {
            plainObject.evaluationTypeId = this.evaluationTypeId;
        }
        if (this.hasOwnProperty('component')) plainObject.component = this.component;
        if (this.hasOwnProperty('evaluationName')) {
            plainObject.evaluationName = this.evaluationName;
        }
        if (this.hasOwnProperty('description')) plainObject.description = this.description;
        if (this.hasOwnProperty('grade')) plainObject.grade = this.grade;
        if (this.hasOwnProperty('weight')) plainObject.weight = this.weight;
        if (this.hasOwnProperty('date')) plainObject.date = this.date;
        if (this.hasOwnProperty('attempt')) plainObject.attempt = this.attempt;
        if (this.hasOwnProperty('gradesClosed')) plainObject.gradesClosed = this.gradesClosed;
        if (this.hasOwnProperty('gradesClosedAt')) {
            plainObject.gradesClosedAt = this.gradesClosedAt;
        }
        if (this.hasOwnProperty('closedBy')) plainObject.closedBy = this.closedBy;
        if (this.hasOwnProperty('observations')) plainObject.observations = this.observations;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default BimesterEvaluation;
