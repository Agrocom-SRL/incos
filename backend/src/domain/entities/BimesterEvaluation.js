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

        if (Object.prototype.hasOwnProperty.call(data, 'teacherAssignmentId')) {
            this.teacherAssignmentId = data.teacherAssignmentId;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'academicPeriodId')) {
            this.academicPeriodId = data.academicPeriodId;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'evaluationTypeId')) {
            this.evaluationTypeId = data.evaluationTypeId;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'component')) {
            this.component = data.component;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'evaluationName')) {
            this.evaluationName = data.evaluationName;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'description')) {
            this.description = data.description;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'points')) {
            this.points = data.points;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'date')) {
            this.date = data.date;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'gradesClosed')) {
            this.gradesClosed = data.gradesClosed;
        }
    }

    isValidComponent() {
        if (!this.component) return false;
        return COMPONENTES_EVALUACION_VALUES.includes(this.component);
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (Object.prototype.hasOwnProperty.call(this, 'teacherAssignmentId')) {
            plainObject.teacherAssignmentId = this.teacherAssignmentId;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'academicPeriodId')) {
            plainObject.academicPeriodId = this.academicPeriodId;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'evaluationTypeId')) {
            plainObject.evaluationTypeId = this.evaluationTypeId;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'component')) plainObject.component = this.component;
        if (Object.prototype.hasOwnProperty.call(this, 'evaluationName')) {
            plainObject.evaluationName = this.evaluationName;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'description')) plainObject.description = this.description;
        if (Object.prototype.hasOwnProperty.call(this, 'points')) plainObject.points = this.points;
        if (Object.prototype.hasOwnProperty.call(this, 'date')) plainObject.date = this.date;
        if (Object.prototype.hasOwnProperty.call(this, 'gradesClosed')) plainObject.gradesClosed = this.gradesClosed;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default BimesterEvaluation;
