import { BaseEntity } from './BaseEntity.js';

/**
 * Domain Entity: EvaluationConfiguration
 * Reparto teórico/práctico por gestión (tabla configuracion_evaluacion).
 */
export class EvaluationConfiguration extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (data.hasOwnProperty('managementId')) {
            this.managementId = data.managementId;
        }
        if (data.hasOwnProperty('theoryQuota')) {
            this.theoryQuota = data.theoryQuota;
        }
        if (data.hasOwnProperty('practiceQuota')) {
            this.practiceQuota = data.practiceQuota;
        }
        if (data.hasOwnProperty('description')) {
            this.description = data.description;
        }
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (this.hasOwnProperty('managementId')) plainObject.managementId = this.managementId;
        if (this.hasOwnProperty('theoryQuota')) plainObject.theoryQuota = this.theoryQuota;
        if (this.hasOwnProperty('practiceQuota')) plainObject.practiceQuota = this.practiceQuota;
        if (this.hasOwnProperty('description')) plainObject.description = this.description;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default EvaluationConfiguration;
