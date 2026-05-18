import { BaseEntity } from './BaseEntity.js';
import { AMBITOS_TIPO_EVALUACION_VALUES } from '../constants/evaluaciones.constants.js';

/**
 * Domain Entity: EvaluationType
 * Catálogo de tipos de evaluación (tabla tipos_evaluacion).
 */
export class EvaluationType extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (data.hasOwnProperty('code')) {
            this.code = data.code;
        }
        if (data.hasOwnProperty('name')) {
            this.name = data.name;
        }
        if (data.hasOwnProperty('description')) {
            this.description = data.description;
        }
        if (data.hasOwnProperty('scope')) {
            this.scope = data.scope;
        }
        if (data.hasOwnProperty('isRecovery')) {
            this.isRecovery = data.isRecovery;
        }
        if (data.hasOwnProperty('allowsMultipleAttempts')) {
            this.allowsMultipleAttempts = data.allowsMultipleAttempts;
        }
    }

    isValidScope() {
        if (!this.scope) return false;
        return AMBITOS_TIPO_EVALUACION_VALUES.includes(this.scope);
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (this.hasOwnProperty('code')) plainObject.code = this.code;
        if (this.hasOwnProperty('name')) plainObject.name = this.name;
        if (this.hasOwnProperty('description')) plainObject.description = this.description;
        if (this.hasOwnProperty('scope')) plainObject.scope = this.scope;
        if (this.hasOwnProperty('isRecovery')) plainObject.isRecovery = this.isRecovery;
        if (this.hasOwnProperty('allowsMultipleAttempts')) {
            plainObject.allowsMultipleAttempts = this.allowsMultipleAttempts;
        }

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default EvaluationType;
