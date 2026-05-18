import { PriorEnrollmentHistory } from '../../domain/entities/PriorEnrollmentHistory.js';
import { BaseMapper } from './BaseMapper.js';

export class PriorEnrollmentHistoryMapper {
    static toEntity(model) {
        if (!model) return null;
        const d = model.dataValues || model;
        const specific = {};
        if ('inscripcionId' in d) specific.enrollmentId = d.inscripcionId;
        if ('asignaturaPlanId' in d) specific.curriculumSubjectId = d.asignaturaPlanId;
        if ('notaFinal' in d) specific.finalGrade = d.notaFinal === null ? null : Number(d.notaFinal);
        if ('estado' in d) specific.status = d.estado;
        return new PriorEnrollmentHistory(BaseMapper.combineBaseAndSpecificFields(model, specific));
    }

    static toModel(entity) {
        const data = entity instanceof PriorEnrollmentHistory ? entity.toPlainObject() : entity;
        return {
            inscripcionId: data.enrollmentId ?? null,
            asignaturaPlanId: data.curriculumSubjectId ?? null,
            notaFinal: data.finalGrade ?? null,
            estado: data.status ?? 'APROBADO',
        };
    }

    static toModelForUpdate(entity) {
        const data = entity instanceof PriorEnrollmentHistory ? entity.toPlainObject() : entity;
        const update = {};
        if ('enrollmentId' in data) update.inscripcionId = data.enrollmentId ?? null;
        if ('curriculumSubjectId' in data) update.asignaturaPlanId = data.curriculumSubjectId ?? null;
        if ('finalGrade' in data) update.notaFinal = data.finalGrade ?? null;
        if ('status' in data) update.estado = data.status;
        Object.assign(update, BaseMapper.baseFieldsToModelForUpdate(entity));
        return update;
    }
}

export default PriorEnrollmentHistoryMapper;
