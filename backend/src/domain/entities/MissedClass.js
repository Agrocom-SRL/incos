import { BaseEntity } from './BaseEntity.js';

/**
 * Domain Entity: MissedClass
 * Clase no dictada por asignación docente (tabla clases_no_dictadas).
 */
export class MissedClass extends BaseEntity {
    constructor(data = {}) {
        super(data);

        if (Object.prototype.hasOwnProperty.call(data, 'teacherAssignmentId')) {
            this.teacherAssignmentId = data.teacherAssignmentId;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'classDate')) {
            this.classDate = data.classDate;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'reason')) {
            this.reason = data.reason;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'reasonDescription')) {
            this.reasonDescription = data.reasonDescription;
        }
    }

    toPlainObject() {
        const plainObject = super.toPlainObject();

        if (Object.prototype.hasOwnProperty.call(this, 'teacherAssignmentId')) {
            plainObject.teacherAssignmentId = this.teacherAssignmentId;
        }
        if (Object.prototype.hasOwnProperty.call(this, 'classDate')) plainObject.classDate = this.classDate;
        if (Object.prototype.hasOwnProperty.call(this, 'reason')) plainObject.reason = this.reason;
        if (Object.prototype.hasOwnProperty.call(this, 'reasonDescription')) {
            plainObject.reasonDescription = this.reasonDescription;
        }

        return plainObject;
    }

    toJSON() {
        return this.toPlainObject();
    }
}

export default MissedClass;
