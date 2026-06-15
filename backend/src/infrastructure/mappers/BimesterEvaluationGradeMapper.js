import { BimesterEvaluationGrade } from '../../domain/entities/BimesterEvaluationGrade.js';
import { BaseMapper } from './BaseMapper.js';

const num = (v) => (v === null || v === undefined ? null : Number(v));

export class BimesterEvaluationGradeMapper {
    static toEntity(model) {
        if (!model) return null;
        const d = model.dataValues || model;
        const specific = {};
        if ('evaluacionId' in d) specific.bimesterEvaluationId = d.evaluacionId;
        if ('bimestreMatriculaId' in d) {
            specific.subjectEnrollmentBimesterId = d.bimestreMatriculaId;
        }
        if ('nota' in d) specific.grade = num(d.nota);
        if ('intento' in d) specific.attempt = d.intento;
        return new BimesterEvaluationGrade(BaseMapper.combineBaseAndSpecificFields(model, specific));
    }

    static toModel(entity) {
        const data = entity instanceof BimesterEvaluationGrade ? entity.toPlainObject() : entity;
        return {
            evaluacionId: data.bimesterEvaluationId ?? null,
            bimestreMatriculaId: data.subjectEnrollmentBimesterId ?? null,
            nota: data.grade ?? null,
            intento: data.attempt ?? 1,
        };
    }

    static toModelForUpdate(entity) {
        const data = entity instanceof BimesterEvaluationGrade ? entity.toPlainObject() : entity;
        const update = {};
        if ('bimesterEvaluationId' in data) update.evaluacionId = data.bimesterEvaluationId ?? null;
        if ('subjectEnrollmentBimesterId' in data) {
            update.bimestreMatriculaId = data.subjectEnrollmentBimesterId ?? null;
        }
        if ('grade' in data) update.nota = data.grade ?? null;
        if ('attempt' in data) update.intento = data.attempt;
        Object.assign(update, BaseMapper.baseFieldsToModelForUpdate(entity));
        return update;
    }
}

export default BimesterEvaluationGradeMapper;
