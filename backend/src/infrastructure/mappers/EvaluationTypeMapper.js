import { EvaluationType } from '../../domain/entities/EvaluationType.js';
import { BaseMapper } from './BaseMapper.js';

export class EvaluationTypeMapper {
    static toEntity(model) {
        if (!model) return null;
        const d = model.dataValues || model;
        const specific = {};
        if ('codigo' in d) specific.code = d.codigo;
        if ('nombre' in d) specific.name = d.nombre;
        if ('descripcion' in d) specific.description = d.descripcion;
        if ('ambito' in d) specific.scope = d.ambito;
        if ('esRecuperatorio' in d) specific.isRecovery = Boolean(d.esRecuperatorio);
        if ('permiteMultiplesIntentos' in d) {
            specific.allowsMultipleAttempts = Boolean(d.permiteMultiplesIntentos);
        }
        return new EvaluationType(BaseMapper.combineBaseAndSpecificFields(model, specific));
    }

    static toModel(entity) {
        const data = entity instanceof EvaluationType ? entity.toPlainObject() : entity;
        return {
            codigo: data.code,
            nombre: data.name,
            descripcion: data.description ?? null,
            ambito: data.scope ?? 'BIMESTRE',
            esRecuperatorio: data.isRecovery ?? false,
            permiteMultiplesIntentos: data.allowsMultipleAttempts ?? false,
        };
    }

    static toModelForUpdate(entity) {
        const data = entity instanceof EvaluationType ? entity.toPlainObject() : entity;
        const update = {};
        if ('code' in data) update.codigo = data.code;
        if ('name' in data) update.nombre = data.name;
        if ('description' in data) update.descripcion = data.description ?? null;
        if ('scope' in data) update.ambito = data.scope;
        if ('isRecovery' in data) update.esRecuperatorio = data.isRecovery;
        if ('allowsMultipleAttempts' in data) {
            update.permiteMultiplesIntentos = data.allowsMultipleAttempts;
        }
        Object.assign(update, BaseMapper.baseFieldsToModelForUpdate(entity));
        return update;
    }
}

export default EvaluationTypeMapper;
