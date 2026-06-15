import { SubjectEnrollmentBimester } from '../../domain/entities/SubjectEnrollmentBimester.js';
import { BaseMapper } from './BaseMapper.js';

const num = (v) => (v === null || v === undefined ? null : Number(v));

export class SubjectEnrollmentBimesterMapper {
    static toEntity(model) {
        if (!model) return null;
        const d = model.dataValues || model;
        const specific = {};
        if ('matriculaMateriaId' in d) specific.subjectEnrollmentId = d.matriculaMateriaId;
        if ('bimestre' in d) specific.bimester = d.bimestre;
        if ('notaTeorico' in d) specific.theoryGrade = num(d.notaTeorico);
        if ('notaPractico' in d) specific.practiceGrade = num(d.notaPractico);
        if ('notaBimestre' in d) specific.bimesterGrade = num(d.notaBimestre);
        if ('pesoBimestre' in d) specific.bimesterWeight = num(d.pesoBimestre);
        if ('estado' in d) specific.status = d.estado;
        if ('fechaCierre' in d) specific.closedAt = d.fechaCierre;
        if ('cerradoPor' in d) specific.closedBy = d.cerradoPor;
        if ('observaciones' in d) specific.observations = d.observaciones;
        return new SubjectEnrollmentBimester(BaseMapper.combineBaseAndSpecificFields(model, specific));
    }

    static toModel(entity) {
        const data = entity instanceof SubjectEnrollmentBimester ? entity.toPlainObject() : entity;
        return {
            matriculaMateriaId: data.subjectEnrollmentId ?? null,
            bimestre: data.bimester ?? null,
            notaTeorico: data.theoryGrade ?? null,
            notaPractico: data.practiceGrade ?? null,
            notaBimestre: data.bimesterGrade ?? null,
            pesoBimestre: data.bimesterWeight ?? 1,
            estado: data.status ?? 'PENDIENTE',
            fechaCierre: data.closedAt ?? null,
            cerradoPor: data.closedBy ?? null,
            observaciones: data.observations ?? null,
        };
    }

    static toModelForUpdate(entity) {
        const data = entity instanceof SubjectEnrollmentBimester ? entity.toPlainObject() : entity;
        const update = {};
        if ('subjectEnrollmentId' in data) update.matriculaMateriaId = data.subjectEnrollmentId ?? null;
        if ('bimester' in data) update.bimestre = data.bimester;
        if ('theoryGrade' in data) update.notaTeorico = data.theoryGrade ?? null;
        if ('practiceGrade' in data) update.notaPractico = data.practiceGrade ?? null;
        if ('bimesterGrade' in data) update.notaBimestre = data.bimesterGrade ?? null;
        if ('bimesterWeight' in data) update.pesoBimestre = data.bimesterWeight;
        if ('status' in data) update.estado = data.status;
        if ('closedAt' in data) update.fechaCierre = data.closedAt ?? null;
        if ('closedBy' in data) update.cerradoPor = data.closedBy ?? null;
        if ('observations' in data) update.observaciones = data.observations ?? null;
        Object.assign(update, BaseMapper.baseFieldsToModelForUpdate(entity));
        return update;
    }
}

export default SubjectEnrollmentBimesterMapper;
