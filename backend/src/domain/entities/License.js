import { BaseEntity } from './BaseEntity.js';
import {
    MOTIVOS_LICENCIAS_VALUES,
    ESTADOS_LICENCIAS_VALUES,
    ESTADOS_LICENCIAS,
} from '../constants/index.js';

/**
 * Domain Entity: License
 * Licencia estudiantil por inscripción y rango de fechas (tabla licencias).
 */
export class License extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (Object.prototype.hasOwnProperty.call(data, 'enrollmentId')) {
            this.enrollmentId = data.enrollmentId;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'requestDate')) {
            this.requestDate = data.requestDate;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'startDate')) {
            this.startDate = data.startDate;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'endDate')) {
            this.endDate = data.endDate;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'totalDays')) {
            this.totalDays = data.totalDays;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'reason')) {
            this.reason = data.reason;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'reasonDetail')) {
            this.reasonDetail = data.reasonDetail;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'state')) {
            this.state = data.state;
        } else if (!Object.prototype.hasOwnProperty.call(data, 'enrollmentId')) {
            this.state = ESTADOS_LICENCIAS.PENDIENTE;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'decisionObservations')) {
            this.decisionObservations = data.decisionObservations;
        }
    }

    isValidReason() {
        if (!this.reason) return false;
        return MOTIVOS_LICENCIAS_VALUES.includes(this.reason);
    }

    isValidState() {
        if (!this.state) return false;
        return ESTADOS_LICENCIAS_VALUES.includes(this.state);
    }

    isValidDateRange() {
        if (!this.startDate || !this.endDate) return false;
        return new Date(this.endDate) >= new Date(this.startDate);
    }

    calculateTotalDays() {
        if (!this.startDate || !this.endDate) return 0;
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    isApproved() {
        return this.state === ESTADOS_LICENCIAS.APROBADA;
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (Object.prototype.hasOwnProperty.call(this, 'enrollmentId')) {
            plainObject.enrollmentId = this.enrollmentId;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'requestDate')) {
            plainObject.requestDate = this.requestDate;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'startDate')) {
            plainObject.startDate = this.startDate;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'endDate')) {
            plainObject.endDate = this.endDate;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'totalDays')) {
            plainObject.totalDays = this.totalDays;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'reason')) {
            plainObject.reason = this.reason;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'reasonDetail')) {
            plainObject.reasonDetail = this.reasonDetail;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'state')) {
            plainObject.state = this.state;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'decisionObservations')) {
            plainObject.decisionObservations = this.decisionObservations;
        }

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default License;
