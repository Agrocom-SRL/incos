import { BaseEntity } from './BaseEntity.js';

/**
 * Domain Entity: FinalEvaluationGrade
 * Celda de evaluación final: nota de un estudiante (tabla evaluaciones_finales_notas).
 */
export class FinalEvaluationGrade extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (data.hasOwnProperty('finalEvaluationId')) {
            this.finalEvaluationId = data.finalEvaluationId;
        }
        if (data.hasOwnProperty('subjectEnrollmentId')) {
            this.subjectEnrollmentId = data.subjectEnrollmentId;
        }
        if (data.hasOwnProperty('grade')) {
            this.grade = data.grade;
        }
        if (data.hasOwnProperty('attempt')) {
            this.attempt = data.attempt;
        }
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (this.hasOwnProperty('finalEvaluationId')) {
            plainObject.finalEvaluationId = this.finalEvaluationId;
        }
        if (this.hasOwnProperty('subjectEnrollmentId')) {
            plainObject.subjectEnrollmentId = this.subjectEnrollmentId;
        }
        if (this.hasOwnProperty('grade')) plainObject.grade = this.grade;
        if (this.hasOwnProperty('attempt')) plainObject.attempt = this.attempt;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default FinalEvaluationGrade;
