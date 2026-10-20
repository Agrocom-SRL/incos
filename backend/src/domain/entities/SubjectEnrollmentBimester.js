import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_BIMESTRE_MATRICULA_VALUES } from '../constants/evaluaciones.constants.js';

/**
 * Domain Entity: SubjectEnrollmentBimester
 * Bimestre de una matrícula a materia (tabla bimestres_matricula).
 */
export class SubjectEnrollmentBimester extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (Object.prototype.hasOwnProperty.call(data, 'subjectEnrollmentId')) {
            this.subjectEnrollmentId = data.subjectEnrollmentId;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'bimester')) {
            this.bimester = data.bimester;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'theoryGrade')) {
            this.theoryGrade = data.theoryGrade;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'practiceGrade')) {
            this.practiceGrade = data.practiceGrade;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'bimesterGrade')) {
            this.bimesterGrade = data.bimesterGrade;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'bimesterWeight')) {
            this.bimesterWeight = data.bimesterWeight;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'makeupGrade')) {
            this.makeupGrade = data.makeupGrade;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'makeupDate')) {
            this.makeupDate = data.makeupDate;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'status')) {
            this.status = data.status;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'closedAt')) {
            this.closedAt = data.closedAt;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'closedBy')) {
            this.closedBy = data.closedBy;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'observations')) {
            this.observations = data.observations;
        }
    }

    isValidStatus() {
        if (!this.status) return false;
        return ESTADOS_BIMESTRE_MATRICULA_VALUES.includes(this.status);
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (Object.prototype.hasOwnProperty.call(this, 'subjectEnrollmentId')) {
            plainObject.subjectEnrollmentId = this.subjectEnrollmentId;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'bimester')) plainObject.bimester = this.bimester;
        if (Object.prototype.hasOwnProperty.call(this, 'theoryGrade')) plainObject.theoryGrade = this.theoryGrade;
        if (Object.prototype.hasOwnProperty.call(this, 'practiceGrade')) plainObject.practiceGrade = this.practiceGrade;
        if (Object.prototype.hasOwnProperty.call(this, 'bimesterGrade')) plainObject.bimesterGrade = this.bimesterGrade;
        if (Object.prototype.hasOwnProperty.call(this, 'bimesterWeight')) plainObject.bimesterWeight = this.bimesterWeight;
        if (Object.prototype.hasOwnProperty.call(this, 'makeupGrade')) plainObject.makeupGrade = this.makeupGrade;
        if (Object.prototype.hasOwnProperty.call(this, 'makeupDate')) plainObject.makeupDate = this.makeupDate;
        if (Object.prototype.hasOwnProperty.call(this, 'status')) plainObject.status = this.status;
        if (Object.prototype.hasOwnProperty.call(this, 'closedAt')) plainObject.closedAt = this.closedAt;
        if (Object.prototype.hasOwnProperty.call(this, 'closedBy')) plainObject.closedBy = this.closedBy;
        if (Object.prototype.hasOwnProperty.call(this, 'observations')) plainObject.observations = this.observations;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default SubjectEnrollmentBimester;
