import { ManagementPlan } from '../../domain/entities/ManagementPlan.js';
import { BaseMapper } from './BaseMapper.js';
import { ESTADOS_GESTION_PLAN } from '../../domain/constants/cursos.constants.js';

/**
 * Mapper: ManagementPlanMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (ManagementPlan)
 */
export class ManagementPlanMapper {
  static toEntity(model) {
    if (!model) return null;

    const specificFields = {
      managementId: model.gestionId,
      studyPlanId: model.planEstudioId,
      name: model.nombre,
      state: model.estado,
      cancellationReason: model.motivoCancelacion,
    };

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new ManagementPlan(entityData);
  }

  static toModel(entity) {
    const data = entity instanceof ManagementPlan ? entity.toPlainObject() : entity;

    return {
      gestionId: data.managementId || null,
      planEstudioId: data.studyPlanId || null,
      nombre: data.name,
      estado: data.state || ESTADOS_GESTION_PLAN.PROPUESTO,
      motivoCancelacion: data.cancellationReason || null,
    };
  }

  static toModelForUpdate(entity) {
    const data = entity instanceof ManagementPlan ? entity.toPlainObject() : entity;
    const updateData = {};

    if (data.managementId !== undefined) { updateData.gestionId = data.managementId || null; }
    if (data.studyPlanId !== undefined) { updateData.planEstudioId = data.studyPlanId || null; }
    if (data.name !== undefined) { updateData.nombre = data.name; }
    if (data.state !== undefined) { updateData.estado = data.state; }
    if (data.cancellationReason !== undefined) { updateData.motivoCancelacion = data.cancellationReason || null; }

    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
