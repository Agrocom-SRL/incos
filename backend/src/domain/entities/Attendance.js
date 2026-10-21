import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_ASISTENCIA_VALUES } from '../constants/evaluaciones.constants.js';

/**
 * Domain Entity: Attendance
 * Registro de asistencia por clase (tabla asistencias).
 */
export class Attendance extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (Object.prototype.hasOwnProperty.call(data, 'subjectEnrollmentId')) {
            this.subjectEnrollmentId = data.subjectEnrollmentId;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'classSessionId')) {
            this.classSessionId = data.classSessionId;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'status')) {
            this.status = data.status;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'observations')) {
            this.observations = data.observations;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'registeredBy')) {
            this.registeredBy = data.registeredBy;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'registeredAt')) {
            this.registeredAt = data.registeredAt;
        }
    }

    isValidStatus() {
        if (!this.status) return false;
        return ESTADOS_ASISTENCIA_VALUES.includes(this.status);
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (Object.prototype.hasOwnProperty.call(this, 'subjectEnrollmentId')) {
            plainObject.subjectEnrollmentId = this.subjectEnrollmentId;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'classSessionId')) plainObject.classSessionId = this.classSessionId;
        if (Object.prototype.hasOwnProperty.call(this, 'status')) plainObject.status = this.status;
        if (Object.prototype.hasOwnProperty.call(this, 'observations')) plainObject.observations = this.observations;
        if (Object.prototype.hasOwnProperty.call(this, 'registeredBy')) plainObject.registeredBy = this.registeredBy;
        if (Object.prototype.hasOwnProperty.call(this, 'registeredAt')) plainObject.registeredAt = this.registeredAt;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default Attendance;
