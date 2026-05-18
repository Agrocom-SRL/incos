import { Leveling } from '../../domain/entities/Leveling.js';
import { BaseMapper } from './BaseMapper.js';

const num = (v) => (v === null || v === undefined ? null : Number(v));

export class LevelingMapper {
    static toEntity(model) {
        if (!model) return null;
        const d = model.dataValues || model;
        const specific = {};
        if ('historialMatriculaId' in d) {
            specific.subjectEnrollmentHistoryId = d.historialMatriculaId;
        }
        if ('gestionId' in d) specific.managementId = d.gestionId;
        if ('docenteEvaluadorId' in d) specific.evaluatorTeacherId = d.docenteEvaluadorId;
        if ('fechaExamen' in d) specific.examDate = d.fechaExamen;
        if ('notaNivelacion' in d) specific.levelingGrade = num(d.notaNivelacion);
        if ('estado' in d) specific.status = d.estado;
        if ('aprobado' in d) specific.passed = d.aprobado === null ? null : Boolean(d.aprobado);
        if ('observaciones' in d) specific.observations = d.observaciones;
        return new Leveling(BaseMapper.combineBaseAndSpecificFields(model, specific));
    }

    static toModel(entity) {
        const data = entity instanceof Leveling ? entity.toPlainObject() : entity;
        return {
            historialMatriculaId: data.subjectEnrollmentHistoryId ?? null,
            gestionId: data.managementId ?? null,
            docenteEvaluadorId: data.evaluatorTeacherId ?? null,
            fechaExamen: data.examDate ?? null,
            notaNivelacion: data.levelingGrade ?? null,
            estado: data.status ?? 'PROGRAMADA',
            aprobado: data.passed ?? null,
            observaciones: data.observations ?? null,
        };
    }

    static toModelForUpdate(entity) {
        const data = entity instanceof Leveling ? entity.toPlainObject() : entity;
        const update = {};
        if ('subjectEnrollmentHistoryId' in data) {
            update.historialMatriculaId = data.subjectEnrollmentHistoryId ?? null;
        }
        if ('managementId' in data) update.gestionId = data.managementId ?? null;
        if ('evaluatorTeacherId' in data) update.docenteEvaluadorId = data.evaluatorTeacherId ?? null;
        if ('examDate' in data) update.fechaExamen = data.examDate ?? null;
        if ('levelingGrade' in data) update.notaNivelacion = data.levelingGrade ?? null;
        if ('status' in data) update.estado = data.status;
        if ('passed' in data) update.aprobado = data.passed;
        if ('observations' in data) update.observaciones = data.observations ?? null;
        Object.assign(update, BaseMapper.baseFieldsToModelForUpdate(entity));
        return update;
    }
}

export default LevelingMapper;
