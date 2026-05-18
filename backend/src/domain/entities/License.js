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

        if (data.hasOwnProperty('enrollmentId')) {
            this.enrollmentId = data.enrollmentId;
        }
        if (data.hasOwnProperty('requestDate')) {
            this.requestDate = data.requestDate;
        }
        if (data.hasOwnProperty('startDate')) {
            this.startDate = data.startDate;
        }
        if (data.hasOwnProperty('endDate')) {
            this.endDate = data.endDate;
        }
        if (data.hasOwnProperty('totalDays')) {
            this.totalDays = data.totalDays;
        }
        if (data.hasOwnProperty('reason')) {
            this.reason = data.reason;
        }
        if (data.hasOwnProperty('reasonDetail')) {
            this.reasonDetail = data.reasonDetail;
        }
        if (data.hasOwnProperty('state')) {
            this.state = data.state;
        } else if (!data.hasOwnProperty('enrollmentId')) {
            this.state = ESTADOS_LICENCIAS.PENDIENTE;
        }
        if (data.hasOwnProperty('rejectionReason')) {
            this.rejectionReason = data.rejectionReason;
        }
        if (data.hasOwnProperty('decisionObservations')) {
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

        if (this.hasOwnProperty('enrollmentId')) {
            plainObject.enrollmentId = this.enrollmentId;
        }
        if (this.hasOwnProperty('requestDate')) {
            plainObject.requestDate = this.requestDate;
        }
        if (this.hasOwnProperty('startDate')) {
            plainObject.startDate = this.startDate;
        }
        if (this.hasOwnProperty('endDate')) {
            plainObject.endDate = this.endDate;
        }
        if (this.hasOwnProperty('totalDays')) {
            plainObject.totalDays = this.totalDays;
        }
        if (this.hasOwnProperty('reason')) {
            plainObject.reason = this.reason;
        }
        if (this.hasOwnProperty('reasonDetail')) {
            plainObject.reasonDetail = this.reasonDetail;
        }
        if (this.hasOwnProperty('state')) {
            plainObject.state = this.state;
        }
        if (this.hasOwnProperty('rejectionReason')) {
            plainObject.rejectionReason = this.rejectionReason;
        }
        if (this.hasOwnProperty('decisionObservations')) {
            plainObject.decisionObservations = this.decisionObservations;
        }

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default License;
