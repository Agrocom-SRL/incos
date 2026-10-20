import { BaseEntity } from './BaseEntity.js';

/**
 * Domain Entity: BimesterEvaluationGrade
 * Celda del cuaderno: nota de un estudiante en una evaluación (tabla evaluaciones_notas).
 */
export class BimesterEvaluationGrade extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (Object.prototype.hasOwnProperty.call(data, 'bimesterEvaluationId')) {
            this.bimesterEvaluationId = data.bimesterEvaluationId;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'subjectEnrollmentBimesterId')) {
            this.subjectEnrollmentBimesterId = data.subjectEnrollmentBimesterId;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'grade')) {
            this.grade = data.grade;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'attempt')) {
            this.attempt = data.attempt;
        }
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (Object.prototype.hasOwnProperty.call(this, 'bimesterEvaluationId')) {
            plainObject.bimesterEvaluationId = this.bimesterEvaluationId;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'subjectEnrollmentBimesterId')) {
            plainObject.subjectEnrollmentBimesterId = this.subjectEnrollmentBimesterId;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'grade')) plainObject.grade = this.grade;
        if (Object.prototype.hasOwnProperty.call(this, 'attempt')) plainObject.attempt = this.attempt;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default BimesterEvaluationGrade;
