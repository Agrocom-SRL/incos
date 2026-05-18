import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_NIVELACION_VALUES } from '../constants/evaluaciones.constants.js';

/**
 * Domain Entity: Leveling
 * Hecho del examen extraordinario (tabla nivelaciones).
 */
export class Leveling extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (data.hasOwnProperty('subjectEnrollmentHistoryId')) {
            this.subjectEnrollmentHistoryId = data.subjectEnrollmentHistoryId;
        }
        if (data.hasOwnProperty('managementId')) {
            this.managementId = data.managementId;
        }
        if (data.hasOwnProperty('evaluatorTeacherId')) {
            this.evaluatorTeacherId = data.evaluatorTeacherId;
        }
        if (data.hasOwnProperty('examDate')) {
            this.examDate = data.examDate;
        }
        if (data.hasOwnProperty('levelingGrade')) {
            this.levelingGrade = data.levelingGrade;
        }
        if (data.hasOwnProperty('status')) {
            this.status = data.status;
        }
        if (data.hasOwnProperty('passed')) {
            this.passed = data.passed;
        }
        if (data.hasOwnProperty('observations')) {
            this.observations = data.observations;
        }
    }

    isValidStatus() {
        if (!this.status) return false;
        return ESTADOS_NIVELACION_VALUES.includes(this.status);
    }

    isValidLevelingGrade() {
        if (this.levelingGrade === null || this.levelingGrade === undefined) return true;
        const grade = Number(this.levelingGrade);
        return !Number.isNaN(grade) && grade >= 0 && grade <= 100;
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (this.hasOwnProperty('subjectEnrollmentHistoryId')) {
            plainObject.subjectEnrollmentHistoryId = this.subjectEnrollmentHistoryId;
        }
        if (this.hasOwnProperty('managementId')) plainObject.managementId = this.managementId;
        if (this.hasOwnProperty('evaluatorTeacherId')) {
            plainObject.evaluatorTeacherId = this.evaluatorTeacherId;
        }
        if (this.hasOwnProperty('examDate')) plainObject.examDate = this.examDate;
        if (this.hasOwnProperty('levelingGrade')) plainObject.levelingGrade = this.levelingGrade;
        if (this.hasOwnProperty('status')) plainObject.status = this.status;
        if (this.hasOwnProperty('passed')) plainObject.passed = this.passed;
        if (this.hasOwnProperty('observations')) plainObject.observations = this.observations;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default Leveling;
