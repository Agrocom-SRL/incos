import { FinalEvaluation } from '../../domain/entities/FinalEvaluation.js';
import { BaseMapper } from './BaseMapper.js';

const num = (v) => (v === null || v === undefined ? null : Number(v));

export class FinalEvaluationMapper {
    static toEntity(model) {
        if (!model) return null;
        const d = model.dataValues || model;
        const specific = {};
        if ('asignacionDocenteId' in d) specific.teacherAssignmentId = d.asignacionDocenteId;
        if ('tipoEvaluacionId' in d) specific.evaluationTypeId = d.tipoEvaluacionId;
        if ('nombreEvaluacion' in d) specific.evaluationName = d.nombreEvaluacion;
        if ('descripcion' in d) specific.description = d.descripcion;
        if ('peso' in d) specific.weight = num(d.peso);
        if ('fecha' in d) specific.date = d.fecha;
        if ('notasCerradas' in d) specific.gradesClosed = Boolean(d.notasCerradas);
        return new FinalEvaluation(BaseMapper.combineBaseAndSpecificFields(model, specific));
    }

    static toModel(entity) {
        const data = entity instanceof FinalEvaluation ? entity.toPlainObject() : entity;
        return {
            asignacionDocenteId: data.teacherAssignmentId ?? null,
            tipoEvaluacionId: data.evaluationTypeId ?? null,
            nombreEvaluacion: data.evaluationName ?? null,
            descripcion: data.description ?? null,
            peso: data.weight ?? 1,
            fecha: data.date ?? null,
            notasCerradas: data.gradesClosed ?? false,
        };
    }

    static toModelForUpdate(entity) {
        const data = entity instanceof FinalEvaluation ? entity.toPlainObject() : entity;
        const update = {};
        if ('teacherAssignmentId' in data) {
            update.asignacionDocenteId = data.teacherAssignmentId ?? null;
        }
        if ('evaluationTypeId' in data) update.tipoEvaluacionId = data.evaluationTypeId ?? null;
        if ('evaluationName' in data) update.nombreEvaluacion = data.evaluationName ?? null;
        if ('description' in data) update.descripcion = data.description ?? null;
        if ('weight' in data) update.peso = data.weight;
        if ('date' in data) update.fecha = data.date ?? null;
        if ('gradesClosed' in data) update.notasCerradas = data.gradesClosed;
        Object.assign(update, BaseMapper.baseFieldsToModelForUpdate(entity));
        return update;
    }
}

export default FinalEvaluationMapper;
