import { BaseEntity } from './BaseEntity.js';

/**
 * Domain Entity: BimesterEvaluationGrade
 * Celda del cuaderno: nota de un estudiante en una evaluación (tabla evaluaciones_notas).
 */
export class BimesterEvaluationGrade extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (data.hasOwnProperty('bimesterEvaluationId')) {
            this.bimesterEvaluationId = data.bimesterEvaluationId;
        }
        if (data.hasOwnProperty('subjectEnrollmentBimesterId')) {
            this.subjectEnrollmentBimesterId = data.subjectEnrollmentBimesterId;
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

        if (this.hasOwnProperty('bimesterEvaluationId')) {
            plainObject.bimesterEvaluationId = this.bimesterEvaluationId;
        }
        if (this.hasOwnProperty('subjectEnrollmentBimesterId')) {
            plainObject.subjectEnrollmentBimesterId = this.subjectEnrollmentBimesterId;
        }
        if (this.hasOwnProperty('grade')) plainObject.grade = this.grade;
        if (this.hasOwnProperty('attempt')) plainObject.attempt = this.attempt;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default BimesterEvaluationGrade;
