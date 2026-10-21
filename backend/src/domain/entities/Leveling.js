import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_NIVELACION_VALUES } from '../constants/evaluaciones.constants.js';

/**
 * Domain Entity: Leveling
 * Hecho del examen extraordinario (tabla nivelaciones).
 */
export class Leveling extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (Object.prototype.hasOwnProperty.call(data, 'subjectEnrollmentHistoryId')) {
            this.subjectEnrollmentHistoryId = data.subjectEnrollmentHistoryId;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'managementId')) {
            this.managementId = data.managementId;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'evaluatorTeacherId')) {
            this.evaluatorTeacherId = data.evaluatorTeacherId;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'examDate')) {
            this.examDate = data.examDate;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'levelingGrade')) {
            this.levelingGrade = data.levelingGrade;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'status')) {
            this.status = data.status;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'passed')) {
            this.passed = data.passed;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'observations')) {
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

        if (Object.prototype.hasOwnProperty.call(this, 'subjectEnrollmentHistoryId')) {
            plainObject.subjectEnrollmentHistoryId = this.subjectEnrollmentHistoryId;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'managementId')) plainObject.managementId = this.managementId;
        if (Object.prototype.hasOwnProperty.call(this, 'evaluatorTeacherId')) {
            plainObject.evaluatorTeacherId = this.evaluatorTeacherId;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'examDate')) plainObject.examDate = this.examDate;
        if (Object.prototype.hasOwnProperty.call(this, 'levelingGrade')) plainObject.levelingGrade = this.levelingGrade;
        if (Object.prototype.hasOwnProperty.call(this, 'status')) plainObject.status = this.status;
        if (Object.prototype.hasOwnProperty.call(this, 'passed')) plainObject.passed = this.passed;
        if (Object.prototype.hasOwnProperty.call(this, 'observations')) plainObject.observations = this.observations;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default Leveling;
