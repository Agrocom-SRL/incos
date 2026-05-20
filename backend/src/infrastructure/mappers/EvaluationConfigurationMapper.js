import { EvaluationConfiguration } from '../../domain/entities/EvaluationConfiguration.js';
import { BaseMapper } from './BaseMapper.js';

export class EvaluationConfigurationMapper {
    static toEntity(model) {
        if (!model) return null;
        const d = model.dataValues || model;
        const specific = {};
        if ('gestionId' in d) specific.managementId = d.gestionId;
        if ('clave' in d) specific.key = d.clave;
        if ('valor' in d) specific.value = d.valor;
        if ('tipo' in d) specific.valueType = d.tipo;
        if ('vigente' in d) specific.isCurrent = d.vigente;
        if ('descripcion' in d) specific.description = d.descripcion;
        return new EvaluationConfiguration(BaseMapper.combineBaseAndSpecificFields(model, specific));
    }

    static toModel(entity) {
        const data = entity instanceof EvaluationConfiguration ? entity.toPlainObject() : entity;
        return {
            gestionId: data.managementId ?? null,
            clave: data.key,
            valor: data.value,
            tipo: data.valueType ?? 'JSON',
            vigente: data.isCurrent ?? false,
            descripcion: data.description ?? null,
        };
    }

    static toModelForUpdate(entity) {
        const data = entity instanceof EvaluationConfiguration ? entity.toPlainObject() : entity;
        const update = {};
        if ('managementId' in data) update.gestionId = data.managementId ?? null;
        if ('key' in data) update.clave = data.key;
        if ('value' in data) update.valor = data.value;
        if ('valueType' in data) update.tipo = data.valueType;
        if ('isCurrent' in data) update.vigente = data.isCurrent;
        if ('description' in data) update.descripcion = data.description ?? null;
        Object.assign(update, BaseMapper.baseFieldsToModelForUpdate(entity));
        return update;
    }
}

export default EvaluationConfigurationMapper;
