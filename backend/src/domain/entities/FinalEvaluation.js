import { BaseEntity } from './BaseEntity.js';

/**
 * Domain Entity: FinalEvaluation
 * Columna de evaluación anual del curso (tabla evaluaciones_finales).
 * Las notas por estudiante viven en FinalEvaluationGrade (evaluaciones_finales_notas).
 */
export class FinalEvaluation extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (data.hasOwnProperty('teacherAssignmentId')) {
            this.teacherAssignmentId = data.teacherAssignmentId;
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
        if (data.hasOwnProperty('weight')) {
            this.weight = data.weight;
        }
        if (data.hasOwnProperty('date')) {
            this.date = data.date;
        }
        if (data.hasOwnProperty('gradesClosed')) {
            this.gradesClosed = data.gradesClosed;
        }
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (this.hasOwnProperty('teacherAssignmentId')) {
            plainObject.teacherAssignmentId = this.teacherAssignmentId;
        }
        if (this.hasOwnProperty('evaluationTypeId')) {
            plainObject.evaluationTypeId = this.evaluationTypeId;
        }
        if (this.hasOwnProperty('evaluationName')) {
            plainObject.evaluationName = this.evaluationName;
        }
        if (this.hasOwnProperty('description')) plainObject.description = this.description;
        if (this.hasOwnProperty('weight')) plainObject.weight = this.weight;
        if (this.hasOwnProperty('date')) plainObject.date = this.date;
        if (this.hasOwnProperty('gradesClosed')) plainObject.gradesClosed = this.gradesClosed;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default FinalEvaluation;
