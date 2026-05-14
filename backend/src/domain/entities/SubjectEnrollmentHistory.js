import { BaseEntity } from './BaseEntity.js';
import {
    TIPOS_ESTADO_HISTORIAL_MATRICULA,
    TIPOS_ESTADO_HISTORIAL_MATRICULA_VALUES,
} from '../constants/inscripciones.constants.js';

/**
 * Domain Entity: SubjectEnrollmentHistory
 * Represents a special operational event in the lifecycle of an enrolled subject.
 */
export class SubjectEnrollmentHistory extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (data.hasOwnProperty('enrollmentSubjectId')) {
            this.enrollmentSubjectId = data.enrollmentSubjectId;
        }

        if (data.hasOwnProperty('stateType')) {
            this.stateType = data.stateType;
        }

        if (data.hasOwnProperty('transitionDate')) {
            this.transitionDate = data.transitionDate;
        }

        if (data.hasOwnProperty('resultingGrade')) {
            this.resultingGrade = data.resultingGrade;
        }

        if (data.hasOwnProperty('forcedGrade')) {
            this.forcedGrade = data.forcedGrade;
        } else if (!data.hasOwnProperty('enrollmentSubjectId')) {
            this.forcedGrade = false;
        }

        if (data.hasOwnProperty('observations')) {
            this.observations = data.observations;
        }

        if (data.hasOwnProperty('current')) {
            this.current = data.current;
        } else if (!data.hasOwnProperty('enrollmentSubjectId')) {
            this.current = true;
        }
    }

    isValidStateType() {
        if (!this.stateType) return false;
        return TIPOS_ESTADO_HISTORIAL_MATRICULA_VALUES.includes(this.stateType);
    }

    hasResultingGrade() {
        return this.resultingGrade !== null && this.resultingGrade !== undefined;
    }

    isValidResultingGrade() {
        if (!this.hasResultingGrade()) return true;

        const grade = Number(this.resultingGrade);
        return !Number.isNaN(grade) && grade >= 0 && grade <= 100;
    }

    isForcedGrade() {
        return this.forcedGrade === true;
    }

    isCurrent() {
        return this.current === true;
    }

    isAnnualRecovery() {
        return this.stateType === TIPOS_ESTADO_HISTORIAL_MATRICULA.RECUPERATORIO_ANUAL;
    }

    isLeveling() {
        return [
            TIPOS_ESTADO_HISTORIAL_MATRICULA.NIVELACION_1RA,
            TIPOS_ESTADO_HISTORIAL_MATRICULA.NIVELACION_2DA,
            TIPOS_ESTADO_HISTORIAL_MATRICULA.PRUEBA_EXCEPCIONAL,
        ].includes(this.stateType);
    }

    isAcademicBlock() {
        return [
            TIPOS_ESTADO_HISTORIAL_MATRICULA.VENCIDA,
            TIPOS_ESTADO_HISTORIAL_MATRICULA.CHOQUE_HORARIO,
            TIPOS_ESTADO_HISTORIAL_MATRICULA.PRE_REQUISITO,
            TIPOS_ESTADO_HISTORIAL_MATRICULA.NO_LLEVA_POR_VOLUNTAD,
        ].includes(this.stateType);
    }

    isHomologation() {
        return this.stateType === TIPOS_ESTADO_HISTORIAL_MATRICULA.HOMOLOGACION;
    }

    isArticle18() {
        return this.stateType === TIPOS_ESTADO_HISTORIAL_MATRICULA.ARTICULO_18;
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (this.hasOwnProperty('enrollmentSubjectId')) {
            plainObject.enrollmentSubjectId = this.enrollmentSubjectId;
        }

        if (this.hasOwnProperty('stateType')) {
            plainObject.stateType = this.stateType;
        }

        if (this.hasOwnProperty('transitionDate')) {
            plainObject.transitionDate = this.transitionDate;
        }

        if (this.hasOwnProperty('resultingGrade')) {
            plainObject.resultingGrade = this.resultingGrade;
        }

        if (this.hasOwnProperty('forcedGrade')) {
            plainObject.forcedGrade = this.forcedGrade;
        }

        if (this.hasOwnProperty('observations')) {
            plainObject.observations = this.observations;
        }

        if (this.hasOwnProperty('current')) {
            plainObject.current = this.current;
        }

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default SubjectEnrollmentHistory;