import { BaseEntity } from './BaseEntity.js';

/**
 * Domain Entity: EvaluationType
 * Catálogo de tipos de evaluación bimestrales (tabla tipos_evaluacion).
 */
export class EvaluationType extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (Object.prototype.hasOwnProperty.call(data, 'code')) {
            this.code = data.code;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'name')) {
            this.name = data.name;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'description')) {
            this.description = data.description;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'isRecovery')) {
            this.isRecovery = data.isRecovery;
        }
    }

    /** Los reintentos se registran en evaluaciones_notas.intento, no en el catálogo. */
    allowsMultipleAttempts() {
        return Boolean(this.isRecovery);
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (Object.prototype.hasOwnProperty.call(this, 'code')) plainObject.code = this.code;
        if (Object.prototype.hasOwnProperty.call(this, 'name')) plainObject.name = this.name;
        if (Object.prototype.hasOwnProperty.call(this, 'description')) plainObject.description = this.description;
        if (Object.prototype.hasOwnProperty.call(this, 'isRecovery')) plainObject.isRecovery = this.isRecovery;

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default EvaluationType;
