import { BaseEntity } from './BaseEntity.js';
import {
    TIPOS_ESTADO_HISTORIAL_MATRICULA,
    TIPOS_ESTADO_HISTORIAL_MATRICULA_VALUES,
    TIPOS_ESTADO_HISTORIAL_MATRICULA_INTENTO_ACADEMICO,
    TIPOS_ESTADO_HISTORIAL_MATRICULA_NOTA_ADMINISTRATIVA,
} from '../constants/inscripciones.constants.js';

/**
 * Domain Entity: SubjectEnrollmentHistory
 *
 * Representa la bitácora del ciclo de vida operativo de una matrícula de materia.
 *
 * Mapeo principal:
 * - subjectEnrollmentId → matricula_materia_id
 * - levelingId          → nivelacion_id
 * - stateType           → tipo_estado
 * - resultingGrade      → nota_resultante
 * - forcedGrade         → nota_forzada
 * - transitionDate      → fecha_transicion
 * - observations        → observaciones
 * - current             → vigente
 */
export class SubjectEnrollmentHistory extends BaseEntity {
    constructor(data = {}) {
        super(data);

        const has = (key) => Object.prototype.hasOwnProperty.call(data, key);

        if (has('subjectEnrollmentId') || has('enrollmentSubjectId') || has('matriculaMateriaId')) {
            this.subjectEnrollmentId =
                data.subjectEnrollmentId ??
                data.enrollmentSubjectId ??
                data.matriculaMateriaId ??
                null;
        }

        if (has('levelingId') || has('nivelacionId')) {
            this.levelingId =
                data.levelingId ??
                data.nivelacionId ??
                null;
        }

        if (has('stateType') || has('tipoEstado')) {
            this.stateType =
                data.stateType ??
                data.tipoEstado ??
                null;
        }

        if (has('transitionDate') || has('fechaTransicion')) {
            this.transitionDate =
                data.transitionDate ??
                data.fechaTransicion ??
                null;
        }

        if (has('resultingGrade') || has('notaResultante')) {
            this.resultingGrade =
                data.resultingGrade ??
                data.notaResultante ??
                null;
        }

        if (has('forcedGrade') || has('notaForzada')) {
            this.forcedGrade =
                data.forcedGrade ??
                data.notaForzada ??
                false;
        } else {
            this.forcedGrade = false;
        }

        if (has('observations') || has('observaciones')) {
            this.observations =
                data.observations ??
                data.observaciones ??
                null;
        }

        if (has('current') || has('vigente')) {
            this.current =
                data.current ??
                data.vigente ??
                true;
        } else {
            this.current = true;
        }
    }

    /**
     * Alias temporal por compatibilidad con código viejo.
     * Antes usabas enrollmentSubjectId.
     */
    get enrollmentSubjectId() {
        return this.subjectEnrollmentId;
    }

    set enrollmentSubjectId(value) {
        this.subjectEnrollmentId = value;
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

    isAcademicAttempt() {
        return TIPOS_ESTADO_HISTORIAL_MATRICULA_INTENTO_ACADEMICO.includes(this.stateType);
    }

    isLeveling() {
        return [
            TIPOS_ESTADO_HISTORIAL_MATRICULA.NIVELACION_1RA,
            TIPOS_ESTADO_HISTORIAL_MATRICULA.NIVELACION_2DA,
            TIPOS_ESTADO_HISTORIAL_MATRICULA.PRUEBA_EXCEPCIONAL,
        ].includes(this.stateType);
    }

    isAnnualRecovery() {
        return this.stateType === TIPOS_ESTADO_HISTORIAL_MATRICULA.RECUPERATORIO_ANUAL;
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

    isAbandonment() {
        return this.stateType === TIPOS_ESTADO_HISTORIAL_MATRICULA.ABANDONO;
    }

    isWithdrawn() {
        return this.stateType === TIPOS_ESTADO_HISTORIAL_MATRICULA.RETIRADO;
    }

    isAdministrativeGradeState() {
        return TIPOS_ESTADO_HISTORIAL_MATRICULA_NOTA_ADMINISTRATIVA.includes(this.stateType);
    }

    /**
     * Regla nueva según tu DDL:
     * nota_resultante solo aplica para ABANDONO, RETIRADO o ARTICULO_18.
     */
    canUseDirectResultingGrade() {
        return this.isAdministrativeGradeState();
    }

    /**
     * Retorna errores de negocio sin lanzar excepción.
     */
    getBusinessRuleErrors() {
        const errors = [];

        if (!this.isValidStateType()) {
            errors.push('El tipo de estado del historial de matrícula no es válido.');
        }

        if (!this.isValidResultingGrade()) {
            errors.push('La nota resultante debe estar entre 0 y 100.');
        }

        if (this.hasResultingGrade() && !this.canUseDirectResultingGrade()) {
            errors.push(
                'notaResultante solo debe usarse para ABANDONO, RETIRADO o ARTICULO_18.'
            );
        }

        if (this.isForcedGrade() && !this.canUseDirectResultingGrade()) {
            errors.push(
                'forcedGrade solo debe usarse cuando el estado permite nota administrativa directa.'
            );
        }

        if (this.isForcedGrade() && !this.hasResultingGrade()) {
            errors.push(
                'Si forcedGrade es TRUE, debe existir resultingGrade.'
            );
        }

        if (this.isAcademicAttempt() && !this.levelingId) {
            errors.push(
                'Los intentos académicos deben vincularse a levelingId/nivelacion_id.'
            );
        }

        return errors;
    }

    isBusinessValid() {
        return this.getBusinessRuleErrors().length === 0;
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (this.hasOwnProperty('subjectEnrollmentId')) {
            plainObject.subjectEnrollmentId = this.subjectEnrollmentId;
        }

        if (this.hasOwnProperty('levelingId')) {
            plainObject.levelingId = this.levelingId;
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