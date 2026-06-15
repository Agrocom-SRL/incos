import { BaseEntity } from './BaseEntity.js';

/**
 * Domain Entity: EvaluationConfiguration
 * Configuración clave-valor por gestión (tabla configuracion_evaluacion).
 */
export class EvaluationConfiguration extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (data.hasOwnProperty('managementId')) {
            this.managementId = data.managementId;
        }
        if (data.hasOwnProperty('key')) {
            this.key = data.key;
        }
        if (data.hasOwnProperty('value')) {
            this.value = data.value;
        }
        if (data.hasOwnProperty('valueType')) {
            this.valueType = data.valueType;
        }
        if (data.hasOwnProperty('isCurrent')) {
            this.isCurrent = data.isCurrent;
        }
        if (data.hasOwnProperty('description')) {
            this.description = data.description;
        }
        // Compat lectura legacy en mappers de política
        if (data.hasOwnProperty('theoryQuota')) {
            this.theoryQuota = data.theoryQuota;
        }
        if (data.hasOwnProperty('practiceQuota')) {
            this.practiceQuota = data.practiceQuota;
        }
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (this.hasOwnProperty('managementId')) plainObject.managementId = this.managementId;
        if (this.hasOwnProperty('key')) plainObject.key = this.key;
        if (this.hasOwnProperty('value')) plainObject.value = this.value;
        if (this.hasOwnProperty('valueType')) plainObject.valueType = this.valueType;
        if (this.hasOwnProperty('isCurrent')) plainObject.isCurrent = this.isCurrent;
        if (this.hasOwnProperty('description')) plainObject.description = this.description;
        if (this.hasOwnProperty('theoryQuota')) plainObject.theoryQuota = this.theoryQuota;
        if (this.hasOwnProperty('practiceQuota')) plainObject.practiceQuota = this.practiceQuota;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default EvaluationConfiguration;
