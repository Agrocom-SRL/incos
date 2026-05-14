import { BaseEntity } from './BaseEntity.js';
import {
    ESTADOS_MATERIA_INSCRITA_VALUES,
    ESTADOS_MATERIA_INSCRITA,
} from '../constants/inscripciones.constants.js';

/**
 * Domain Entity: SubjectEnrollment
 * Represents a subject enrolled by a student within an annual enrollment.
 */
export class SubjectEnrollment extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (data.hasOwnProperty('enrollmentId')) {
            this.enrollmentId = data.enrollmentId;
        }

        if (data.hasOwnProperty('teacherAssignmentId')) {
            this.teacherAssignmentId = data.teacherAssignmentId;
        }

        if (data.hasOwnProperty('curriculumSubjectId')) {
            this.curriculumSubjectId = data.curriculumSubjectId;
        }

        if (data.hasOwnProperty('finalGrade')) {
            this.finalGrade = data.finalGrade;
        }

        if (data.hasOwnProperty('status')) {
            this.status = data.status;
        } else if (!data.hasOwnProperty('enrollmentId')) {
            this.status = ESTADOS_MATERIA_INSCRITA.INSCRITO;
        }

        if (data.hasOwnProperty('statusHistory')) {
            this.statusHistory = data.statusHistory;
        }

        if (data.hasOwnProperty('observations')) {
            this.observations = data.observations;
        }
    }

    isValidStatus() {
        if (!this.status) return false;
        return ESTADOS_MATERIA_INSCRITA_VALUES.includes(this.status);
    }

    isEnrolled() {
        return this.status === ESTADOS_MATERIA_INSCRITA.INSCRITO;
    }

    isInProgress() {
        return this.status === ESTADOS_MATERIA_INSCRITA.CURSANDO;
    }

    isApproved() {
        return this.status === ESTADOS_MATERIA_INSCRITA.APROBADO;
    }

    isFailed() {
        return this.status === ESTADOS_MATERIA_INSCRITA.REPROBADO;
    }

    isAbandoned() {
        return this.status === ESTADOS_MATERIA_INSCRITA.ABANDONO;
    }

    isWithdrawn() {
        return this.status === ESTADOS_MATERIA_INSCRITA.RETIRADO;
    }

    isValidFinalGrade() {
        if (this.finalGrade === null || this.finalGrade === undefined) return true;

        const grade = Number(this.finalGrade);
        return !Number.isNaN(grade) && grade >= 0 && grade <= 100;
    }

    isApprovedByGrade(minGrade = 61) {
        if (this.finalGrade === null || this.finalGrade === undefined) return false;

        const grade = Number(this.finalGrade);
        return !Number.isNaN(grade) && grade >= minGrade;
    }

    addStatusToHistory(status, date = new Date()) {
        if (!ESTADOS_MATERIA_INSCRITA_VALUES.includes(status)) {
            throw new Error(`Invalid enrollment subject status: ${status}`);
        }

        const currentHistory = this.statusHistory || {};
        const dateValue = date instanceof Date ? date.toISOString().slice(0, 10) : date;

        this.statusHistory = {
            ...currentHistory,
            [status]: dateValue,
        };

        this.status = status;
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (this.hasOwnProperty('enrollmentId')) {
            plainObject.enrollmentId = this.enrollmentId;
        }

        if (this.hasOwnProperty('teacherAssignmentId')) {
            plainObject.teacherAssignmentId = this.teacherAssignmentId;
        }

        if (this.hasOwnProperty('curriculumSubjectId')) {
            plainObject.curriculumSubjectId = this.curriculumSubjectId;
        }

        if (this.hasOwnProperty('finalGrade')) {
            plainObject.finalGrade = this.finalGrade;
        }

        if (this.hasOwnProperty('status')) {
            plainObject.status = this.status;
        }

        if (this.hasOwnProperty('statusHistory')) {
            plainObject.statusHistory = this.statusHistory;
        }

        if (this.hasOwnProperty('observations')) {
            plainObject.observations = this.observations;
        }

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default SubjectEnrollment;