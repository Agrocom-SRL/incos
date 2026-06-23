import { Op } from 'sequelize';
import { IAsistenciaRepository } from '../../domain/interfaces/repositories/IAsistenciaRepository.js';
import { Asistencia as AsistenciaModel } from '../database/models/asistencia.js';
import { BaseRepository } from './BaseRepository.js';
import { AttendanceMapper } from '../mappers/AttendanceMapper.js';
import { ESTADOS_ASISTENCIA } from '../../domain/constants/asistencia.constants.js';
import { sequelize } from '../database/sequelize.js';

/**
 * @implements {IAsistenciaRepository}
 */
export class AttendanceRepository extends BaseRepository {
    getModel() {
        return AsistenciaModel;
    }

    toEntity(model) {
        return AttendanceMapper.toEntity(model);
    }

    buildWhereClause(filters = {}) {
        const where = {};

        if (
            filters.subjectEnrollmentIds &&
            Array.isArray(filters.subjectEnrollmentIds) &&
            filters.subjectEnrollmentIds.length > 0
        ) {
            where.matriculaMateriaId = { [Op.in]: filters.subjectEnrollmentIds };
        } else if (filters.subjectEnrollmentId) {
            where.matriculaMateriaId = filters.subjectEnrollmentId;
        }

        if (filters.classSessionId !== undefined) {
            where.sesionClaseId = filters.classSessionId;
        }

        if (filters.statuses && Array.isArray(filters.statuses) && filters.statuses.length > 0) {
            where.estado = { [Op.in]: filters.statuses };
        } else if (filters.status) {
            where.estado = filters.status;
        }

        if (filters.registeredBy !== undefined) {
            where.registradoPor = filters.registeredBy;
        }

        return where;
    }

    getSearchFields() {
        return ['observaciones'];
    }

    getDefaultSort() {
        return [['fechaRegistro', 'DESC'], ['id', 'DESC']];
    }

    mapDataToModel(data, userId = null) {
        return AttendanceMapper.toModel(data);
    }

    mapDataToUpdate(data, userId = null) {
        return AttendanceMapper.toModelForUpdate(data);
    }

    getCollectionName() {
        return 'attendances';
    }

    /**
     * Upsert SPARSE de una marca ligada a una sesión. Solo persiste AUSENTE/TARDANZA;
     * si la marca pasa a PRESENTE, BORRA (soft delete) la fila existente.
     *
     * @param {Object} params
     * @param {number} params.sesionClaseId
     * @param {number} params.matriculaMateriaId
     * @param {string} params.estado PRESENTE/AUSENTE/TARDANZA
     * @param {number} params.usuarioId
     * @param {import('sequelize').Transaction} [transaction]
     * @returns {Promise<{ accion: 'creada'|'actualizada'|'borrada'|'sin_cambio' }>}
     */
    async upsertMarcaSparse(
        { sesionClaseId, matriculaMateriaId, estado, usuarioId },
        transaction = null,
    ) {
        const existente = await AsistenciaModel.findOne({
            where: {
                sesionClaseId,
                matriculaMateriaId,
                deletedAt: null,
            },
            transaction,
        });

        // PRESENTE = implícito: no se persiste. Si había fila, se borra.
        if (estado === ESTADOS_ASISTENCIA.PRESENTE) {
            if (existente) {
                await existente.update({ updatedBy: usuarioId }, { transaction });
                await existente.destroy({ transaction });
                return { accion: 'borrada' };
            }
            return { accion: 'sin_cambio' };
        }

        if (existente) {
            if (existente.estado === estado) {
                return { accion: 'sin_cambio' };
            }
            await existente.update({ estado, updatedBy: usuarioId }, { transaction });
            return { accion: 'actualizada' };
        }

        await AsistenciaModel.create(
            {
                sesionClaseId,
                matriculaMateriaId,
                estado,
                registradoPor: usuarioId,
                createdBy: usuarioId,
                updatedBy: usuarioId,
            },
            { transaction },
        );
        return { accion: 'creada' };
    }

    /**
     * Marcas persistidas (AUSENTE/TARDANZA) de un curso en un rango de fechas.
     * @param {number} asignacionDocenteId
     * @param {string} desde
     * @param {string} hasta
     * @returns {Promise<Array<Object>>}
     */
    async listarMarcasCursoRango(asignacionDocenteId, desde, hasta) {
        return sequelize.query(
            `
            SELECT
              a.id,
              a.sesion_clase_id,
              a.matricula_materia_id,
              sc.fecha AS fecha_clase,
              a.estado
            FROM asistencias a
            INNER JOIN sesiones_clase sc
              ON sc.id = a.sesion_clase_id
              AND sc.deleted_at IS NULL
            WHERE sc.asignacion_docente_id = ?
              AND sc.fecha BETWEEN ? AND ?
              AND a.deleted_at IS NULL
              AND a.activo = TRUE
            `,
            {
                replacements: [asignacionDocenteId, desde, hasta],
                type: sequelize.QueryTypes.SELECT,
            },
        );
    }
}

export default AttendanceRepository;
