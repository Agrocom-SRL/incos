import { BaseEntity } from './BaseEntity.js';

/**
 * Domain Entity: MissedClass
 * Clase no dictada por asignación docente (tabla clases_no_dictadas).
 */
export class MissedClass extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (data.hasOwnProperty('teacherAssignmentId')) {
            this.teacherAssignmentId = data.teacherAssignmentId;
        }
        if (data.hasOwnProperty('classDate')) {
            this.classDate = data.classDate;
        }
        if (data.hasOwnProperty('reason')) {
            this.reason = data.reason;
        }
        if (data.hasOwnProperty('reasonDescription')) {
            this.reasonDescription = data.reasonDescription;
        }
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (this.hasOwnProperty('teacherAssignmentId')) {
            plainObject.teacherAssignmentId = this.teacherAssignmentId;
        }
        if (this.hasOwnProperty('classDate')) plainObject.classDate = this.classDate;
        if (this.hasOwnProperty('reason')) plainObject.reason = this.reason;
        if (this.hasOwnProperty('reasonDescription')) {
            plainObject.reasonDescription = this.reasonDescription;
        }

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default MissedClass;
