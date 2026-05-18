import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_ASISTENCIA_VALUES } from '../constants/evaluaciones.constants.js';

/**
 * Domain Entity: Attendance
 * Registro de asistencia por clase (tabla asistencias).
 */
export class Attendance extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (data.hasOwnProperty('subjectEnrollmentId')) {
            this.subjectEnrollmentId = data.subjectEnrollmentId;
        }
        if (data.hasOwnProperty('classDate')) {
            this.classDate = data.classDate;
        }
        if (data.hasOwnProperty('classTime')) {
            this.classTime = data.classTime;
        }
        if (data.hasOwnProperty('status')) {
            this.status = data.status;
        }
        if (data.hasOwnProperty('observations')) {
            this.observations = data.observations;
        }
        if (data.hasOwnProperty('registeredBy')) {
            this.registeredBy = data.registeredBy;
        }
        if (data.hasOwnProperty('registeredAt')) {
            this.registeredAt = data.registeredAt;
        }
    }

    isValidStatus() {
        if (!this.status) return false;
        return ESTADOS_ASISTENCIA_VALUES.includes(this.status);
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (this.hasOwnProperty('subjectEnrollmentId')) {
            plainObject.subjectEnrollmentId = this.subjectEnrollmentId;
        }
        if (this.hasOwnProperty('classDate')) plainObject.classDate = this.classDate;
        if (this.hasOwnProperty('classTime')) plainObject.classTime = this.classTime;
        if (this.hasOwnProperty('status')) plainObject.status = this.status;
        if (this.hasOwnProperty('observations')) plainObject.observations = this.observations;
        if (this.hasOwnProperty('registeredBy')) plainObject.registeredBy = this.registeredBy;
        if (this.hasOwnProperty('registeredAt')) plainObject.registeredAt = this.registeredAt;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default Attendance;
