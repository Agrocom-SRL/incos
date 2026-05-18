import { EvaluationConfiguration } from '../../domain/entities/EvaluationConfiguration.js';
import { BaseMapper } from './BaseMapper.js';

export class EvaluationConfigurationMapper {
    static toEntity(model) {
        if (!model) return null;
        const d = model.dataValues || model;
        const specific = {};
        if ('gestionId' in d) specific.managementId = d.gestionId;
        if ('cuotaTeorico' in d) specific.theoryQuota = Number(d.cuotaTeorico);
        if ('cuotaPractico' in d) specific.practiceQuota = Number(d.cuotaPractico);
        if ('descripcion' in d) specific.description = d.descripcion;
        return new EvaluationConfiguration(BaseMapper.combineBaseAndSpecificFields(model, specific));
    }

    static toModel(entity) {
        const data = entity instanceof EvaluationConfiguration ? entity.toPlainObject() : entity;
        return {
            gestionId: data.managementId ?? null,
            cuotaTeorico: data.theoryQuota ?? 30,
            cuotaPractico: data.practiceQuota ?? 70,
            descripcion: data.description ?? null,
        };
    }

    static toModelForUpdate(entity) {
        const data = entity instanceof EvaluationConfiguration ? entity.toPlainObject() : entity;
        const update = {};
        if ('managementId' in data) update.gestionId = data.managementId ?? null;
        if ('theoryQuota' in data) update.cuotaTeorico = data.theoryQuota;
        if ('practiceQuota' in data) update.cuotaPractico = data.practiceQuota;
        if ('description' in data) update.descripcion = data.description ?? null;
        Object.assign(update, BaseMapper.baseFieldsToModelForUpdate(entity));
        return update;
    }
}

export default EvaluationConfigurationMapper;
