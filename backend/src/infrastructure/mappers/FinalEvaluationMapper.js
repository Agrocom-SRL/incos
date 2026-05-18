import { FinalEvaluation } from '../../domain/entities/FinalEvaluation.js';
import { BaseMapper } from './BaseMapper.js';

const num = (v) => (v === null || v === undefined ? null : Number(v));

export class FinalEvaluationMapper {
    static toEntity(model) {
        if (!model) return null;
        const d = model.dataValues || model;
        const specific = {};
        if ('matriculaMateriaId' in d) specific.subjectEnrollmentId = d.matriculaMateriaId;
        if ('tipoEvaluacionId' in d) specific.evaluationTypeId = d.tipoEvaluacionId;
        if ('nombreEvaluacion' in d) specific.evaluationName = d.nombreEvaluacion;
        if ('descripcion' in d) specific.description = d.descripcion;
        if ('nota' in d) specific.grade = num(d.nota);
        if ('peso' in d) specific.weight = num(d.peso);
        if ('fecha' in d) specific.date = d.fecha;
        if ('notasCerradas' in d) specific.gradesClosed = Boolean(d.notasCerradas);
        if ('fechaCierreNotas' in d) specific.gradesClosedAt = d.fechaCierreNotas;
        if ('cerradasPor' in d) specific.closedBy = d.cerradasPor;
        if ('observaciones' in d) specific.observations = d.observaciones;
        return new FinalEvaluation(BaseMapper.combineBaseAndSpecificFields(model, specific));
    }

    static toModel(entity) {
        const data = entity instanceof FinalEvaluation ? entity.toPlainObject() : entity;
        return {
            matriculaMateriaId: data.subjectEnrollmentId ?? null,
            tipoEvaluacionId: data.evaluationTypeId ?? null,
            nombreEvaluacion: data.evaluationName ?? null,
            descripcion: data.description ?? null,
            nota: data.grade ?? null,
            peso: data.weight ?? 1,
            fecha: data.date ?? null,
            notasCerradas: data.gradesClosed ?? false,
            fechaCierreNotas: data.gradesClosedAt ?? null,
            cerradasPor: data.closedBy ?? null,
            observaciones: data.observations ?? null,
        };
    }

    static toModelForUpdate(entity) {
        const data = entity instanceof FinalEvaluation ? entity.toPlainObject() : entity;
        const update = {};
        if ('subjectEnrollmentId' in data) update.matriculaMateriaId = data.subjectEnrollmentId ?? null;
        if ('evaluationTypeId' in data) update.tipoEvaluacionId = data.evaluationTypeId ?? null;
        if ('evaluationName' in data) update.nombreEvaluacion = data.evaluationName ?? null;
        if ('description' in data) update.descripcion = data.description ?? null;
        if ('grade' in data) update.nota = data.grade ?? null;
        if ('weight' in data) update.peso = data.weight;
        if ('date' in data) update.fecha = data.date ?? null;
        if ('gradesClosed' in data) update.notasCerradas = data.gradesClosed;
        if ('gradesClosedAt' in data) update.fechaCierreNotas = data.gradesClosedAt ?? null;
        if ('closedBy' in data) update.cerradasPor = data.closedBy ?? null;
        if ('observations' in data) update.observaciones = data.observations ?? null;
        Object.assign(update, BaseMapper.baseFieldsToModelForUpdate(entity));
        return update;
    }
}

export default FinalEvaluationMapper;
