import { BimesterEvaluation } from '../../domain/entities/BimesterEvaluation.js';
import { BaseMapper } from './BaseMapper.js';

const num = (v) => (v === null || v === undefined ? null : Number(v));

export class BimesterEvaluationMapper {
    static toEntity(model) {
        if (!model) return null;
        const d = model.dataValues || model;
        const specific = {};
        if ('bimestreMatriculaId' in d) {
            specific.subjectEnrollmentBimesterId = d.bimestreMatriculaId;
        }
        if ('tipoEvaluacionId' in d) specific.evaluationTypeId = d.tipoEvaluacionId;
        if ('componente' in d) specific.component = d.componente;
        if ('nombreEvaluacion' in d) specific.evaluationName = d.nombreEvaluacion;
        if ('descripcion' in d) specific.description = d.descripcion;
        if ('nota' in d) specific.grade = num(d.nota);
        if ('peso' in d) specific.weight = num(d.peso);
        if ('fecha' in d) specific.date = d.fecha;
        if ('intento' in d) specific.attempt = d.intento;
        if ('notasCerradas' in d) specific.gradesClosed = Boolean(d.notasCerradas);
        if ('fechaCierreNotas' in d) specific.gradesClosedAt = d.fechaCierreNotas;
        if ('cerradasPor' in d) specific.closedBy = d.cerradasPor;
        if ('observaciones' in d) specific.observations = d.observaciones;
        return new BimesterEvaluation(BaseMapper.combineBaseAndSpecificFields(model, specific));
    }

    static toModel(entity) {
        const data = entity instanceof BimesterEvaluation ? entity.toPlainObject() : entity;
        return {
            bimestreMatriculaId: data.subjectEnrollmentBimesterId ?? null,
            tipoEvaluacionId: data.evaluationTypeId ?? null,
            componente: data.component ?? 'PRACTICO',
            nombreEvaluacion: data.evaluationName ?? null,
            descripcion: data.description ?? null,
            nota: data.grade ?? null,
            peso: data.weight ?? 1,
            fecha: data.date ?? null,
            intento: data.attempt ?? 1,
            notasCerradas: data.gradesClosed ?? false,
            fechaCierreNotas: data.gradesClosedAt ?? null,
            cerradasPor: data.closedBy ?? null,
            observaciones: data.observations ?? null,
        };
    }

    static toModelForUpdate(entity) {
        const data = entity instanceof BimesterEvaluation ? entity.toPlainObject() : entity;
        const update = {};
        if ('subjectEnrollmentBimesterId' in data) {
            update.bimestreMatriculaId = data.subjectEnrollmentBimesterId ?? null;
        }
        if ('evaluationTypeId' in data) update.tipoEvaluacionId = data.evaluationTypeId ?? null;
        if ('component' in data) update.componente = data.component;
        if ('evaluationName' in data) update.nombreEvaluacion = data.evaluationName ?? null;
        if ('description' in data) update.descripcion = data.description ?? null;
        if ('grade' in data) update.nota = data.grade ?? null;
        if ('weight' in data) update.peso = data.weight;
        if ('date' in data) update.fecha = data.date ?? null;
        if ('attempt' in data) update.intento = data.attempt;
        if ('gradesClosed' in data) update.notasCerradas = data.gradesClosed;
        if ('gradesClosedAt' in data) update.fechaCierreNotas = data.gradesClosedAt ?? null;
        if ('closedBy' in data) update.cerradasPor = data.closedBy ?? null;
        if ('observations' in data) update.observaciones = data.observations ?? null;
        Object.assign(update, BaseMapper.baseFieldsToModelForUpdate(entity));
        return update;
    }
}

export default BimesterEvaluationMapper;
