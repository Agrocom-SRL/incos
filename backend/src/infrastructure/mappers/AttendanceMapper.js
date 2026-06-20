import { Attendance } from '../../domain/entities/Attendance.js';
import { BaseMapper } from './BaseMapper.js';

export class AttendanceMapper {
    static toEntity(model) {
        if (!model) return null;
        const d = model.dataValues || model;
        const specific = {};
        if ('matriculaMateriaId' in d) specific.subjectEnrollmentId = d.matriculaMateriaId;
        if ('sesionClaseId' in d) specific.classSessionId = d.sesionClaseId;
        if ('estado' in d) specific.status = d.estado;
        if ('observaciones' in d) specific.observations = d.observaciones;
        if ('registradoPor' in d) specific.registeredBy = d.registradoPor;
        if ('fechaRegistro' in d) specific.registeredAt = d.fechaRegistro;
        return new Attendance(BaseMapper.combineBaseAndSpecificFields(model, specific));
    }

    static toModel(entity) {
        const data = entity instanceof Attendance ? entity.toPlainObject() : entity;
        return {
            matriculaMateriaId: data.subjectEnrollmentId ?? null,
            sesionClaseId: data.classSessionId ?? null,
            estado: data.status ?? 'AUSENTE',
            observaciones: data.observations ?? null,
            registradoPor: data.registeredBy ?? null,
            fechaRegistro: data.registeredAt ?? null,
        };
    }

    static toModelForUpdate(entity) {
        const data = entity instanceof Attendance ? entity.toPlainObject() : entity;
        const update = {};
        if ('subjectEnrollmentId' in data) update.matriculaMateriaId = data.subjectEnrollmentId ?? null;
        if ('classSessionId' in data) update.sesionClaseId = data.classSessionId ?? null;
        if ('status' in data) update.estado = data.status;
        if ('observations' in data) update.observaciones = data.observations ?? null;
        if ('registeredBy' in data) update.registradoPor = data.registeredBy ?? null;
        if ('registeredAt' in data) update.fechaRegistro = data.registeredAt ?? null;
        Object.assign(update, BaseMapper.baseFieldsToModelForUpdate(entity));
        return update;
    }
}

export default AttendanceMapper;
