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

        if (data.hasOwnProperty('academicDataId')) {
            this.academicDataId = data.academicDataId;
        }

        if (data.hasOwnProperty('managementId')) {
            this.managementId = data.managementId;
        }

        if (data.hasOwnProperty('enrollmentType')) {
            this.enrollmentType = data.enrollmentType;
        } else if (!data.hasOwnProperty('academicDataId')) {
            this.enrollmentType = TIPOS_INSCRIPCION.ANTIGUO;
        }

        if (data.hasOwnProperty('enrollmentDate')) {
            this.enrollmentDate = data.enrollmentDate;
        }

        if (data.hasOwnProperty('observations')) {
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

        if (this.hasOwnProperty('academicDataId')) {
            plainObject.academicDataId = this.academicDataId;
        }

        if (this.hasOwnProperty('managementId')) {
            plainObject.managementId = this.managementId;
        }

        if (this.hasOwnProperty('enrollmentType')) {
            plainObject.enrollmentType = this.enrollmentType;
        }

        if (this.hasOwnProperty('enrollmentDate')) {
            plainObject.enrollmentDate = this.enrollmentDate;
        }

        if (this.hasOwnProperty('observations')) {
            plainObject.observations = this.observations;
        }

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default Enrollment;
