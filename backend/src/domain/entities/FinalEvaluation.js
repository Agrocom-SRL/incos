import { BaseEntity } from './BaseEntity.js';

/**
 * Domain Entity: FinalEvaluation
 * Evaluación de materia completa (tabla evaluaciones_finales).
 */
export class FinalEvaluation extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (data.hasOwnProperty('subjectEnrollmentId')) {
            this.subjectEnrollmentId = data.subjectEnrollmentId;
        }
        if (data.hasOwnProperty('evaluationTypeId')) {
            this.evaluationTypeId = data.evaluationTypeId;
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

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (this.hasOwnProperty('subjectEnrollmentId')) {
            plainObject.subjectEnrollmentId = this.subjectEnrollmentId;
        }
        if (this.hasOwnProperty('evaluationTypeId')) {
            plainObject.evaluationTypeId = this.evaluationTypeId;
        }
        if (this.hasOwnProperty('evaluationName')) {
            plainObject.evaluationName = this.evaluationName;
        }
        if (this.hasOwnProperty('description')) plainObject.description = this.description;
        if (this.hasOwnProperty('grade')) plainObject.grade = this.grade;
        if (this.hasOwnProperty('weight')) plainObject.weight = this.weight;
        if (this.hasOwnProperty('date')) plainObject.date = this.date;
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

export default FinalEvaluation;
