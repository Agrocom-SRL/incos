import { BaseEntity } from './BaseEntity.js';

/**
 * Domain Entity: EvaluationType
 * Catálogo de tipos de evaluación bimestrales (tabla tipos_evaluacion).
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
        if (data.hasOwnProperty('isRecovery')) {
            this.isRecovery = data.isRecovery;
        }
    }

    /** Los reintentos se registran en evaluaciones_notas.intento, no en el catálogo. */
    allowsMultipleAttempts() {
        return Boolean(this.isRecovery);
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (this.hasOwnProperty('code')) plainObject.code = this.code;
        if (this.hasOwnProperty('name')) plainObject.name = this.name;
        if (this.hasOwnProperty('description')) plainObject.description = this.description;
        if (this.hasOwnProperty('isRecovery')) plainObject.isRecovery = this.isRecovery;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default EvaluationType;
