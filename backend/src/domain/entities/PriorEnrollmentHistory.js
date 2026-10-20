import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_HISTORIAL_PREVIO_VALUES } from '../constants/evaluaciones.constants.js';

/**
 * Domain Entity: PriorEnrollmentHistory
 * Materias aprobadas o convalidadas cargadas al inscribir (tabla historial_previo).
 */
export class PriorEnrollmentHistory extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (Object.prototype.hasOwnProperty.call(data, 'enrollmentId')) {
            this.enrollmentId = data.enrollmentId;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'curriculumSubjectId')) {
            this.curriculumSubjectId = data.curriculumSubjectId;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'finalGrade')) {
            this.finalGrade = data.finalGrade;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'status')) {
            this.status = data.status;
        }
    }

    isValidStatus() {
        if (!this.status) return false;
        return ESTADOS_HISTORIAL_PREVIO_VALUES.includes(this.status);
    }

    isValidFinalGrade() {
        if (this.finalGrade === null || this.finalGrade === undefined) return true;
        const grade = Number(this.finalGrade);
        return !Number.isNaN(grade) && grade >= 0 && grade <= 100;
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (Object.prototype.hasOwnProperty.call(this, 'enrollmentId')) {
            plainObject.enrollmentId = this.enrollmentId;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'curriculumSubjectId')) {
            plainObject.curriculumSubjectId = this.curriculumSubjectId;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'finalGrade')) {
            plainObject.finalGrade = this.finalGrade;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'status')) {
            plainObject.status = this.status;
        }

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default PriorEnrollmentHistory;
