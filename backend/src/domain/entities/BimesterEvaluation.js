import { BaseEntity } from './BaseEntity.js';
import { COMPONENTES_EVALUACION_VALUES } from '../constants/evaluaciones.constants.js';

/**
 * Domain Entity: BimesterEvaluation
 * Columna del cuaderno docente (tabla evaluaciones). Una fila por evaluación lógica del curso × bimestre.
 * Las notas por estudiante viven en BimesterEvaluationGrade (evaluaciones_notas).
 */
export class BimesterEvaluation extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (data.hasOwnProperty('teacherAssignmentId')) {
            this.teacherAssignmentId = data.teacherAssignmentId;
        }
        if (data.hasOwnProperty('academicPeriodId')) {
            this.academicPeriodId = data.academicPeriodId;
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
        if (data.hasOwnProperty('points')) {
            this.points = data.points;
        }
        if (data.hasOwnProperty('date')) {
            this.date = data.date;
        }
        if (data.hasOwnProperty('gradesClosed')) {
            this.gradesClosed = data.gradesClosed;
        }
    }

    isValidComponent() {
        if (!this.component) return false;
        return COMPONENTES_EVALUACION_VALUES.includes(this.component);
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (this.hasOwnProperty('teacherAssignmentId')) {
            plainObject.teacherAssignmentId = this.teacherAssignmentId;
        }
        if (this.hasOwnProperty('academicPeriodId')) {
            plainObject.academicPeriodId = this.academicPeriodId;
        }
        if (this.hasOwnProperty('evaluationTypeId')) {
            plainObject.evaluationTypeId = this.evaluationTypeId;
        }
        if (this.hasOwnProperty('component')) plainObject.component = this.component;
        if (this.hasOwnProperty('evaluationName')) {
            plainObject.evaluationName = this.evaluationName;
        }
        if (this.hasOwnProperty('description')) plainObject.description = this.description;
        if (this.hasOwnProperty('points')) plainObject.points = this.points;
        if (this.hasOwnProperty('date')) plainObject.date = this.date;
        if (this.hasOwnProperty('gradesClosed')) plainObject.gradesClosed = this.gradesClosed;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default BimesterEvaluation;
