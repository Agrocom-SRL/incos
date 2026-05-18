import { License } from '../../domain/entities/License.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: LicenseMapper — Licencia ↔ License
 */
export class LicenseMapper {
    static toEntity(model) {
        if (!model) return null;

        const dataValues = model.dataValues || model;
        const specificFields = {};

        if ('inscripcionId' in dataValues) specificFields.enrollmentId = dataValues.inscripcionId;
        if ('fechaSolicitud' in dataValues) specificFields.requestDate = dataValues.fechaSolicitud;
        if ('fechaInicio' in dataValues) specificFields.startDate = dataValues.fechaInicio;
        if ('fechaFin' in dataValues) specificFields.endDate = dataValues.fechaFin;
        if ('totalDias' in dataValues) specificFields.totalDays = dataValues.totalDias;
        if ('motivo' in dataValues) specificFields.reason = dataValues.motivo;
        if ('detalleMotivo' in dataValues) specificFields.reasonDetail = dataValues.detalleMotivo;
        if ('estado' in dataValues) specificFields.state = dataValues.estado;
        if ('motivoRechazo' in dataValues) specificFields.rejectionReason = dataValues.motivoRechazo;
        if ('observacionesDecision' in dataValues) {
            specificFields.decisionObservations = dataValues.observacionesDecision;
        }

        return new License(BaseMapper.combineBaseAndSpecificFields(model, specificFields));
    }

    static toModel(entity) {
        const data = entity instanceof License ? entity.toPlainObject() : entity;

        return {
            inscripcionId: data.enrollmentId ?? null,
            fechaSolicitud: data.requestDate,
            fechaInicio: data.startDate,
            fechaFin: data.endDate,
            totalDias: data.totalDays ?? null,
            motivo: data.reason,
            detalleMotivo: data.reasonDetail,
            estado: data.state ?? 'PENDIENTE',
            motivoRechazo: data.rejectionReason ?? null,
            observacionesDecision: data.decisionObservations ?? null,
        };
    }

    static toModelForUpdate(entity) {
        const data = entity instanceof License ? entity.toPlainObject() : entity;
        const updateData = {};

        if ('enrollmentId' in data) updateData.inscripcionId = data.enrollmentId ?? null;
        if ('requestDate' in data) updateData.fechaSolicitud = data.requestDate;
        if ('startDate' in data) updateData.fechaInicio = data.startDate;
        if ('endDate' in data) updateData.fechaFin = data.endDate;
        if ('totalDays' in data) updateData.totalDias = data.totalDays;
        if ('reason' in data) updateData.motivo = data.reason;
        if ('reasonDetail' in data) updateData.detalleMotivo = data.reasonDetail;
        if ('state' in data) updateData.estado = data.state;
        if ('rejectionReason' in data) updateData.motivoRechazo = data.rejectionReason ?? null;
        if ('decisionObservations' in data) {
            updateData.observacionesDecision = data.decisionObservations ?? null;
        }

        Object.assign(updateData, BaseMapper.baseFieldsToModelForUpdate(entity));
        return updateData;
    }

    static toEntityList(models) {
        if (!models?.length) return [];
        return models.map((m) => this.toEntity(m)).filter(Boolean);
    }
}

export default LicenseMapper;
