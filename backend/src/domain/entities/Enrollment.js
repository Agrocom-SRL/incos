import { BaseEntity } from './BaseEntity.js';
import {
    TIPOS_INSCRIPCION_VALUES,
    TIPOS_INSCRIPCION,
} from '../constants/inscripciones.constants.js';

/**
 * Domain Entity: Enrollment
 * Represents the annual enrollment of a student in an academic management period.
 */
export class Enrollment extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (Object.prototype.hasOwnProperty.call(data, 'academicDataId')) {
            this.academicDataId = data.academicDataId;
        }

        if (Object.prototype.hasOwnProperty.call(data, 'managementId')) {
            this.managementId = data.managementId;
        }

        if (Object.prototype.hasOwnProperty.call(data, 'enrollmentType')) {
            this.enrollmentType = data.enrollmentType;
        } else if (!Object.prototype.hasOwnProperty.call(data, 'academicDataId')) {
            this.enrollmentType = TIPOS_INSCRIPCION.ANTIGUO;
        }

        if (Object.prototype.hasOwnProperty.call(data, 'enrollmentDate')) {
            this.enrollmentDate = data.enrollmentDate;
        }

        if (Object.prototype.hasOwnProperty.call(data, 'observations')) {
            this.observations = data.observations;
        }
    }

    isValidEnrollmentType() {
        if (!this.enrollmentType) return false;
        return TIPOS_INSCRIPCION_VALUES.includes(this.enrollmentType);
    }

    isNewStudent() {
        return this.enrollmentType === TIPOS_INSCRIPCION.NUEVO;
    }

    isOldStudent() {
        return this.enrollmentType === TIPOS_INSCRIPCION.ANTIGUO;
    }

    isTransfer() {
        return this.enrollmentType === TIPOS_INSCRIPCION.TRASPASO;
    }

    isTransitability() {
        return this.enrollmentType === TIPOS_INSCRIPCION.TRANSITABILIDAD;
    }

    /**
     * Backward compatibility.
     * ANTIGUO is now represented as ANTIGUO.
     */
    isContinuity() {
        return this.isOldStudent();
    }

    isReentry() {
        return this.isOldStudent();
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (Object.prototype.hasOwnProperty.call(this, 'academicDataId')) {
            plainObject.academicDataId = this.academicDataId;
        }

        if (Object.prototype.hasOwnProperty.call(this, 'managementId')) {
            plainObject.managementId = this.managementId;
        }

        if (Object.prototype.hasOwnProperty.call(this, 'enrollmentType')) {
            plainObject.enrollmentType = this.enrollmentType;
        }

        if (Object.prototype.hasOwnProperty.call(this, 'enrollmentDate')) {
            plainObject.enrollmentDate = this.enrollmentDate;
        }

        if (Object.prototype.hasOwnProperty.call(this, 'observations')) {
            plainObject.observations = this.observations;
        }

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default Enrollment;
