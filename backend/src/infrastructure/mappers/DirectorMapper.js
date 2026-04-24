import { Director } from '../../domain/entities/Director.js';
import { BaseMapper } from './BaseMapper.js';

export class DirectorMapper {
  static toEntity(model) {
    if (!model) return null;

    const dataValues = model.dataValues || model;
    const specificFields = {};

    if ('personalId' in dataValues && dataValues.personalId !== undefined) {
      specificFields.staffId = dataValues.personalId;
    }
    if ('tipo' in dataValues && dataValues.tipo !== undefined) {
      specificFields.type = dataValues.tipo;
    }
    if ('fechaNombramiento' in dataValues && dataValues.fechaNombramiento !== undefined) {
      specificFields.appointmentDate = dataValues.fechaNombramiento;
    }
    if ('resolucionNombramiento' in dataValues && dataValues.resolucionNombramiento !== undefined) {
      specificFields.appointmentResolution = dataValues.resolucionNombramiento;
    }
    if ('tituloProfesional' in dataValues && dataValues.tituloProfesional !== undefined) {
      specificFields.professionalTitle = dataValues.tituloProfesional;
    }
    if ('especialidad' in dataValues && dataValues.especialidad !== undefined) {
      specificFields.specialty = dataValues.especialidad;
    }
    if ('nivelAcademico' in dataValues && dataValues.nivelAcademico !== undefined) {
      specificFields.academicLevel = dataValues.nivelAcademico;
    }
    if ('institucionEgreso' in dataValues && dataValues.institucionEgreso !== undefined) {
      specificFields.graduationInstitution = dataValues.institucionEgreso;
    }
    if ('anioEgreso' in dataValues && dataValues.anioEgreso !== undefined) {
      specificFields.graduationYear = dataValues.anioEgreso;
    }

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new Director(entityData);
  }

  static toModel(entity) {
    const data = entity instanceof Director ? entity.toPlainObject() : entity;
    return {
      personalId: data.staffId,
      tipo: data.type,
      fechaNombramiento: data.appointmentDate,
      resolucionNombramiento: data.appointmentResolution,
      tituloProfesional: data.professionalTitle,
      especialidad: data.specialty,
      nivelAcademico: data.academicLevel,
      institucionEgreso: data.graduationInstitution,
      anioEgreso: data.graduationYear,
    };
  }

  static toModelForUpdate(entity) {
    const data = entity instanceof Director ? entity.toPlainObject() : entity;
    const updateData = {};

    if ('staffId' in data) updateData.personalId = data.staffId;
    if ('type' in data) updateData.tipo = data.type;
    if ('appointmentDate' in data) updateData.fechaNombramiento = data.appointmentDate;
    if ('appointmentResolution' in data) updateData.resolucionNombramiento = data.appointmentResolution;
    if ('professionalTitle' in data) updateData.tituloProfesional = data.professionalTitle;
    if ('specialty' in data) updateData.especialidad = data.specialty;
    if ('academicLevel' in data) updateData.nivelAcademico = data.academicLevel;
    if ('graduationInstitution' in data) updateData.institucionEgreso = data.graduationInstitution;
    if ('graduationYear' in data) updateData.anioEgreso = data.graduationYear;

    Object.assign(updateData, BaseMapper.baseFieldsToModelForUpdate(entity));
    return updateData;
  }

  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((m) => this.toEntity(m)).filter((e) => e !== null);
  }
}
