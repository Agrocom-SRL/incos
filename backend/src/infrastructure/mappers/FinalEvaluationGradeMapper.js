import { FinalEvaluationGrade } from '../../domain/entities/FinalEvaluationGrade.js';
import { BaseMapper } from './BaseMapper.js';

const num = (v) => (v === null || v === undefined ? null : Number(v));

export class FinalEvaluationGradeMapper {
    static toEntity(model) {
        if (!model) return null;
        const d = model.dataValues || model;
        const specific = {};
        if ('evaluacionFinalId' in d) specific.finalEvaluationId = d.evaluacionFinalId;
        if ('matriculaMateriaId' in d) specific.subjectEnrollmentId = d.matriculaMateriaId;
        if ('nota' in d) specific.grade = num(d.nota);
        if ('intento' in d) specific.attempt = d.intento;
        return new FinalEvaluationGrade(BaseMapper.combineBaseAndSpecificFields(model, specific));
    }

    static toModel(entity) {
        const data = entity instanceof FinalEvaluationGrade ? entity.toPlainObject() : entity;
        return {
            evaluacionFinalId: data.finalEvaluationId ?? null,
            matriculaMateriaId: data.subjectEnrollmentId ?? null,
            nota: data.grade ?? null,
            intento: data.attempt ?? 1,
        };
    }

    static toModelForUpdate(entity) {
        const data = entity instanceof FinalEvaluationGrade ? entity.toPlainObject() : entity;
        const update = {};
        if ('finalEvaluationId' in data) update.evaluacionFinalId = data.finalEvaluationId ?? null;
        if ('subjectEnrollmentId' in data) update.matriculaMateriaId = data.subjectEnrollmentId ?? null;
        if ('grade' in data) update.nota = data.grade ?? null;
        if ('attempt' in data) update.intento = data.attempt;
        Object.assign(update, BaseMapper.baseFieldsToModelForUpdate(entity));
        return update;
    }
}

export default FinalEvaluationGradeMapper;
