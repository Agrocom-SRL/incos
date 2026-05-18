import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_BIMESTRE_MATRICULA_VALUES } from '../constants/evaluaciones.constants.js';

/**
 * Domain Entity: SubjectEnrollmentBimester
 * Bimestre de una matrícula a materia (tabla bimestres_matricula).
 */
export class SubjectEnrollmentBimester extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (data.hasOwnProperty('subjectEnrollmentId')) {
            this.subjectEnrollmentId = data.subjectEnrollmentId;
        }
        if (data.hasOwnProperty('bimester')) {
            this.bimester = data.bimester;
        }
        if (data.hasOwnProperty('theoryGrade')) {
            this.theoryGrade = data.theoryGrade;
        }
        if (data.hasOwnProperty('practiceGrade')) {
            this.practiceGrade = data.practiceGrade;
        }
        if (data.hasOwnProperty('bimesterGrade')) {
            this.bimesterGrade = data.bimesterGrade;
        }
        if (data.hasOwnProperty('bimesterWeight')) {
            this.bimesterWeight = data.bimesterWeight;
        }
        if (data.hasOwnProperty('makeupGrade')) {
            this.makeupGrade = data.makeupGrade;
        }
        if (data.hasOwnProperty('makeupDate')) {
            this.makeupDate = data.makeupDate;
        }
        if (data.hasOwnProperty('status')) {
            this.status = data.status;
        }
        if (data.hasOwnProperty('closedAt')) {
            this.closedAt = data.closedAt;
        }
        if (data.hasOwnProperty('closedBy')) {
            this.closedBy = data.closedBy;
        }
        if (data.hasOwnProperty('observations')) {
            this.observations = data.observations;
        }
    }

    isValidStatus() {
        if (!this.status) return false;
        return ESTADOS_BIMESTRE_MATRICULA_VALUES.includes(this.status);
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (this.hasOwnProperty('subjectEnrollmentId')) {
            plainObject.subjectEnrollmentId = this.subjectEnrollmentId;
        }
        if (this.hasOwnProperty('bimester')) plainObject.bimester = this.bimester;
        if (this.hasOwnProperty('theoryGrade')) plainObject.theoryGrade = this.theoryGrade;
        if (this.hasOwnProperty('practiceGrade')) plainObject.practiceGrade = this.practiceGrade;
        if (this.hasOwnProperty('bimesterGrade')) plainObject.bimesterGrade = this.bimesterGrade;
        if (this.hasOwnProperty('bimesterWeight')) plainObject.bimesterWeight = this.bimesterWeight;
        if (this.hasOwnProperty('makeupGrade')) plainObject.makeupGrade = this.makeupGrade;
        if (this.hasOwnProperty('makeupDate')) plainObject.makeupDate = this.makeupDate;
        if (this.hasOwnProperty('status')) plainObject.status = this.status;
        if (this.hasOwnProperty('closedAt')) plainObject.closedAt = this.closedAt;
        if (this.hasOwnProperty('closedBy')) plainObject.closedBy = this.closedBy;
        if (this.hasOwnProperty('observations')) plainObject.observations = this.observations;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default SubjectEnrollmentBimester;
