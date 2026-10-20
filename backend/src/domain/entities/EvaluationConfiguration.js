import { BaseEntity } from './BaseEntity.js';

/**
 * Domain Entity: EvaluationConfiguration
 * Configuración clave-valor por gestión (tabla configuracion_evaluacion).
 */
export class EvaluationConfiguration extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (Object.prototype.hasOwnProperty.call(data, 'managementId')) {
            this.managementId = data.managementId;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'key')) {
            this.key = data.key;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'value')) {
            this.value = data.value;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'valueType')) {
            this.valueType = data.valueType;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'isCurrent')) {
            this.isCurrent = data.isCurrent;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'description')) {
            this.description = data.description;
        }
        // Compat lectura legacy en mappers de política
        if (Object.prototype.hasOwnProperty.call(data, 'theoryQuota')) {
            this.theoryQuota = data.theoryQuota;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'practiceQuota')) {
            this.practiceQuota = data.practiceQuota;
        }
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (Object.prototype.hasOwnProperty.call(this, 'managementId')) plainObject.managementId = this.managementId;
        if (Object.prototype.hasOwnProperty.call(this, 'key')) plainObject.key = this.key;
        if (Object.prototype.hasOwnProperty.call(this, 'value')) plainObject.value = this.value;
        if (Object.prototype.hasOwnProperty.call(this, 'valueType')) plainObject.valueType = this.valueType;
        if (Object.prototype.hasOwnProperty.call(this, 'isCurrent')) plainObject.isCurrent = this.isCurrent;
        if (Object.prototype.hasOwnProperty.call(this, 'description')) plainObject.description = this.description;
        if (Object.prototype.hasOwnProperty.call(this, 'theoryQuota')) plainObject.theoryQuota = this.theoryQuota;
        if (Object.prototype.hasOwnProperty.call(this, 'practiceQuota')) plainObject.practiceQuota = this.practiceQuota;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default EvaluationConfiguration;
