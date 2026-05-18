import { MissedClass } from '../../domain/entities/MissedClass.js';
import { BaseMapper } from './BaseMapper.js';

export class MissedClassMapper {
    static toEntity(model) {
        if (!model) return null;
        const d = model.dataValues || model;
        const specific = {};
        if ('asignacionDocenteId' in d) specific.teacherAssignmentId = d.asignacionDocenteId;
        if ('fechaClase' in d) specific.classDate = d.fechaClase;
        if ('motivo' in d) specific.reason = d.motivo;
        if ('descripcionMotivo' in d) specific.reasonDescription = d.descripcionMotivo;
        return new MissedClass(BaseMapper.combineBaseAndSpecificFields(model, specific));
    }

    static toModel(entity) {
        const data = entity instanceof MissedClass ? entity.toPlainObject() : entity;
        return {
            asignacionDocenteId: data.teacherAssignmentId ?? null,
            fechaClase: data.classDate,
            motivo: data.reason,
            descripcionMotivo: data.reasonDescription ?? null,
        };
    }

    static toModelForUpdate(entity) {
        const data = entity instanceof MissedClass ? entity.toPlainObject() : entity;
        const update = {};
        if ('teacherAssignmentId' in data) {
            update.asignacionDocenteId = data.teacherAssignmentId ?? null;
        }
        if ('classDate' in data) update.fechaClase = data.classDate;
        if ('reason' in data) update.motivo = data.reason;
        if ('reasonDescription' in data) update.descripcionMotivo = data.reasonDescription ?? null;
        Object.assign(update, BaseMapper.baseFieldsToModelForUpdate(entity));
        return update;
    }
}

export default MissedClassMapper;
