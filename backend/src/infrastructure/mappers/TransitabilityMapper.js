import { Transitability } from '../../domain/entities/Transitability.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: TransitabilityMapper
 *
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Transitability)
 * Sigue el mismo patrón que EnrollmentMapper/CountryMapper usando BaseMapper.
 */
export class TransitabilityMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio Transitability.
   * Usa BaseMapper.combineBaseAndSpecificFields para agregar campos base (id, activo, auditoría).
   */
  static toEntity(model) {
    if (!model) return null;

    const dataValues = model.dataValues || model;
    const specificFields = {};

    if ('estudianteId' in dataValues) {
      specificFields.estudianteId = dataValues.estudianteId;
    }
    if ('institucionOrigenId' in dataValues) {
      specificFields.institucionOrigenId = dataValues.institucionOrigenId;
    }
    if ('carreraOrigen' in dataValues) {
      specificFields.carreraOrigen = dataValues.carreraOrigen;
    }
    if ('anioConclusion' in dataValues) {
      specificFields.anioConclusion = dataValues.anioConclusion;
    }
    if ('carreraDestinoId' in dataValues) {
      specificFields.carreraDestinoId = dataValues.carreraDestinoId;
    }
    if ('planEstudioDestinoId' in dataValues) {
      specificFields.planEstudioDestinoId = dataValues.planEstudioDestinoId;
    }
    if ('regimenEstudios' in dataValues) {
      specificFields.regimenEstudios = dataValues.regimenEstudios;
    }
    if ('aceptaCompromiso' in dataValues) {
      specificFields.aceptaCompromiso = dataValues.aceptaCompromiso;
    }
    if ('fechaCompromiso' in dataValues) {
      specificFields.fechaCompromiso = dataValues.fechaCompromiso;
    }
    if ('estado' in dataValues) {
      specificFields.estado = dataValues.estado;
    }
    if ('fechaSolicitud' in dataValues) {
      specificFields.fechaSolicitud = dataValues.fechaSolicitud;
    }
    if ('fechaResolucion' in dataValues) {
      specificFields.fechaResolucion = dataValues.fechaResolucion;
    }
    if ('resueltoPor' in dataValues) {
      specificFields.resueltoPor = dataValues.resueltoPor;
    }
    if ('motivoNoProcedente' in dataValues) {
      specificFields.motivoNoProcedente = dataValues.motivoNoProcedente;
    }
    if ('observaciones' in dataValues) {
      specificFields.observaciones = dataValues.observaciones;
    }

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new Transitability(entityData);
  }

  /**
   * Convierte una entidad Transitability u objeto plano a formato del modelo Sequelize (INSERT).
   */
  static toModel(entity) {
    const data = entity instanceof Transitability ? entity.toPlainObject() : entity;

    return {
      estudianteId: data.estudianteId ?? null,
      institucionOrigenId: data.institucionOrigenId ?? null,
      carreraOrigen: data.carreraOrigen,
      anioConclusion: data.anioConclusion ?? null,
      carreraDestinoId: data.carreraDestinoId ?? null,
      planEstudioDestinoId: data.planEstudioDestinoId ?? null,
      regimenEstudios: data.regimenEstudios ?? null,
      aceptaCompromiso: data.aceptaCompromiso ?? false,
      fechaCompromiso: data.fechaCompromiso ?? null,
      estado: data.estado ?? 'SOLICITADO',
      fechaSolicitud: data.fechaSolicitud ?? null,
      fechaResolucion: data.fechaResolucion ?? null,
      resueltoPor: data.resueltoPor ?? null,
      motivoNoProcedente: data.motivoNoProcedente ?? null,
      observaciones: data.observaciones ?? null,
    };
  }

  /**
   * Convierte una entidad Transitability u objeto plano a formato del modelo Sequelize (UPDATE).
   * Usa BaseMapper.baseFieldsToModelForUpdate para campos base (activo, etc.).
   */
  static toModelForUpdate(entity) {
    const data = entity instanceof Transitability ? entity.toPlainObject() : entity;
    const updateData = {};

    if ('estudianteId' in data) {
      updateData.estudianteId = data.estudianteId ?? null;
    }
    if ('institucionOrigenId' in data) {
      updateData.institucionOrigenId = data.institucionOrigenId ?? null;
    }
    if ('carreraOrigen' in data) {
      updateData.carreraOrigen = data.carreraOrigen;
    }
    if ('anioConclusion' in data) {
      updateData.anioConclusion = data.anioConclusion ?? null;
    }
    if ('carreraDestinoId' in data) {
      updateData.carreraDestinoId = data.carreraDestinoId ?? null;
    }
    if ('planEstudioDestinoId' in data) {
      updateData.planEstudioDestinoId = data.planEstudioDestinoId ?? null;
    }
    if ('regimenEstudios' in data) {
      updateData.regimenEstudios = data.regimenEstudios ?? null;
    }
    if ('aceptaCompromiso' in data) {
      updateData.aceptaCompromiso = data.aceptaCompromiso ?? false;
    }
    if ('fechaCompromiso' in data) {
      updateData.fechaCompromiso = data.fechaCompromiso ?? null;
    }
    if ('estado' in data) {
      updateData.estado = data.estado ?? 'SOLICITADO';
    }
    if ('fechaSolicitud' in data) {
      updateData.fechaSolicitud = data.fechaSolicitud ?? null;
    }
    if ('fechaResolucion' in data) {
      updateData.fechaResolucion = data.fechaResolucion ?? null;
    }
    if ('resueltoPor' in data) {
      updateData.resueltoPor = data.resueltoPor ?? null;
    }
    if ('motivoNoProcedente' in data) {
      updateData.motivoNoProcedente = data.motivoNoProcedente ?? null;
    }
    if ('observaciones' in data) {
      updateData.observaciones = data.observaciones ?? null;
    }

    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  /**
   * Convierte un array de modelos Sequelize a array de entidades Transitability.
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((m) => this.toEntity(m)).filter((e) => e !== null);
  }
}
