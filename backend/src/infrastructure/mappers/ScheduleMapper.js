import { Schedule } from '../../domain/entities/Schedule.js';
import { BaseMapper } from './BaseMapper.js';
import { TIPOS_HORARIO } from '../../domain/constants/cursos.constants.js';

/**
 * Mapper: ScheduleMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Schedule)
 */
export class ScheduleMapper {
  static toEntity(model) {
    if (!model) return null;

    const specificFields = {
      name: model.nombre,
      day: model.dia,
      startTime: model.horaInicio,
      endTime: model.horaFin,
      shift: model.turno,
      blockNumber: model.numeroBloque,
      scheduleType: model.tipoHorario,
    };

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new Schedule(entityData);
  }

  static toModel(entity) {
    const data = entity instanceof Schedule ? entity.toPlainObject() : entity;

    return {
      nombre: data.name || null,
      dia: data.day || null,
      horaInicio: data.startTime || null,
      horaFin: data.endTime || null,
      turno: data.shift || null,
      numeroBloque: data.blockNumber || null,
      tipoHorario: data.scheduleType || TIPOS_HORARIO.CLASES,
    };
  }

  static toModelForUpdate(entity) {
    const data = entity instanceof Schedule ? entity.toPlainObject() : entity;
    const updateData = {};

    if (data.name !== undefined) { updateData.nombre = data.name || null; }
    if (data.day !== undefined) { updateData.dia = data.day || null; }
    if (data.startTime !== undefined) { updateData.horaInicio = data.startTime || null; }
    if (data.endTime !== undefined) { updateData.horaFin = data.endTime || null; }
    if (data.shift !== undefined) { updateData.turno = data.shift || null; }
    if (data.blockNumber !== undefined) { updateData.numeroBloque = data.blockNumber || null; }
    if (data.scheduleType !== undefined) { updateData.tipoHorario = data.scheduleType; }

    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
