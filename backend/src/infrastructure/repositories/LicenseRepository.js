import { Op } from 'sequelize';
import { ILicenciaRepository } from '../../domain/interfaces/repositories/ILicenciaRepository.js';
import { Licencia as LicenciaModel } from '../database/models/licencia.js';
import { BaseRepository } from './BaseRepository.js';
import { LicenseMapper } from '../mappers/LicenseMapper.js';
import { sequelize } from '../database/sequelize.js';

/**
 * Fragmento de nombre del estudiante en orden institucional
 * (APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES), cruzando la cadena canónica
 * licencias → inscripciones → estudiantes_datos_academicos → estudiantes.
 * @see docs/plan/MODULO-ASISTENCIA.md §8 (contrato estudianteNombre).
 */
const ESTUDIANTE_NOMBRE_SQL =
  "TRIM(CONCAT_WS(' ', e.apellido_paterno, e.apellido_materno, e.nombres))";

/**
 * Implementación del repositorio de licencias (`licencias`).
 *
 * @implements {ILicenciaRepository}
 */
export class LicenseRepository extends BaseRepository {
    getModel() {
        return LicenciaModel;
    }

    toEntity(model) {
        return LicenseMapper.toEntity(model);
    }

    buildWhereClause(filters = {}) {
        const where = {};

        if (
            filters.enrollmentIds &&
            Array.isArray(filters.enrollmentIds) &&
            filters.enrollmentIds.length > 0
        ) {
            where.inscripcionId = { [Op.in]: filters.enrollmentIds };
        } else if (filters.enrollmentId) {
            where.inscripcionId = filters.enrollmentId;
        }

        if (filters.states && Array.isArray(filters.states) && filters.states.length > 0) {
            where.estado = { [Op.in]: filters.states };
        } else if (filters.state) {
            where.estado = filters.state;
        }

        if (filters.requestDate !== undefined) {
            where.fechaSolicitud = filters.requestDate;
        }
        if (filters.startDate !== undefined) {
            where.fechaInicio = filters.startDate;
        }
        if (filters.endDate !== undefined) {
            where.fechaFin = filters.endDate;
        }
        if (filters.totalDays !== undefined) {
            where.totalDias = filters.totalDays;
        }
        if (filters.reason) {
            where.motivo = filters.reason;
        }
        if (filters.reasonDetail !== undefined) {
            where.detalleMotivo = filters.reasonDetail;
        }
        if (filters.rejectionReason !== undefined) {
            where.motivoRechazo = filters.rejectionReason;
        }
        if (filters.decisionObservations !== undefined) {
            where.observacionesDecision = filters.decisionObservations;
        }

        return where;
    }

    getSearchFields() {
        return ['detalleMotivo', 'observacionesDecision', 'motivoRechazo'];
    }

    getDefaultSort() {
        return [['fechaSolicitud', 'DESC'], ['id', 'DESC']];
    }

    mapDataToModel(data, userId = null) {
        return LicenseMapper.toModel(data);
    }

    mapDataToUpdate(data, userId = null) {
        return LicenseMapper.toModelForUpdate(data);
    }

    getCollectionName() {
        return 'licenses';
    }

    /**
     * Lista licencias (filas planas) con el nombre del estudiante resuelto por JOIN.
     * No usa associations de Sequelize (no existen en el proyecto) ni vistas SQL nuevas:
     * raw query sobre tablas base, patrón de EnrollmentRepository.obtenerInscripcionActual.
     *
     * @param {Object} [filters]
     * @param {string[]} [filters.states] - Estados a incluir (PENDIENTE/APROBADA/...).
     * @returns {Promise<Array>} filas: id, inscripcion_id, estudiante_nombre, fecha_solicitud,
     *   fecha_inicio, fecha_fin, total_dias, motivo, detalle_motivo, estado, motivo_rechazo,
     *   observaciones_decision, gestion_id.
     */
    async findAllWithStudentName(filters = {}) {
        const whereConditions = ['l.deleted_at IS NULL', 'l.activo = TRUE'];
        const replacements = [];

        if (Array.isArray(filters.states) && filters.states.length > 0) {
            whereConditions.push(`l.estado IN (${filters.states.map(() => '?').join(', ')})`);
            replacements.push(...filters.states);
        }

        const query = `
      SELECT
        l.id,
        l.inscripcion_id,
        ${ESTUDIANTE_NOMBRE_SQL} AS estudiante_nombre,
        l.fecha_solicitud,
        l.fecha_inicio,
        l.fecha_fin,
        l.total_dias,
        l.motivo,
        l.detalle_motivo,
        l.estado,
        l.motivo_rechazo,
        l.observaciones_decision,
        i.gestion_id
      FROM licencias l
      LEFT JOIN inscripciones i ON i.id = l.inscripcion_id
      LEFT JOIN estudiantes_datos_academicos eda ON eda.id = i.datos_academicos_id
      LEFT JOIN estudiantes e ON e.id = eda.estudiante_id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY l.fecha_solicitud DESC, l.id DESC
    `;

        return sequelize.query(query, {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        });
    }

    /**
     * Una licencia (fila plana) con el nombre del estudiante resuelto por JOIN.
     * @param {number} id
     * @returns {Promise<Object|null>}
     */
    async findByIdWithStudentName(id) {
        const query = `
      SELECT
        l.id,
        l.inscripcion_id,
        ${ESTUDIANTE_NOMBRE_SQL} AS estudiante_nombre,
        l.fecha_solicitud,
        l.fecha_inicio,
        l.fecha_fin,
        l.total_dias,
        l.motivo,
        l.detalle_motivo,
        l.estado,
        l.motivo_rechazo,
        l.observaciones_decision,
        i.gestion_id
      FROM licencias l
      LEFT JOIN inscripciones i ON i.id = l.inscripcion_id
      LEFT JOIN estudiantes_datos_academicos eda ON eda.id = i.datos_academicos_id
      LEFT JOIN estudiantes e ON e.id = eda.estudiante_id
      WHERE l.id = ? AND l.deleted_at IS NULL
      LIMIT 1
    `;

        const rows = await sequelize.query(query, {
            replacements: [id],
            type: sequelize.QueryTypes.SELECT,
        });
        return rows[0] ?? null;
    }

    /**
     * Datos de la inscripción para validar existencia y derivar gestión/estudiante.
     * @param {number} inscripcionId
     * @returns {Promise<{gestionId: number|null, estudianteNombre: string|null}|null>}
     */
    async getInscripcionInfo(inscripcionId) {
        const query = `
      SELECT
        i.id,
        i.gestion_id,
        ${ESTUDIANTE_NOMBRE_SQL} AS estudiante_nombre
      FROM inscripciones i
      LEFT JOIN estudiantes_datos_academicos eda ON eda.id = i.datos_academicos_id
      LEFT JOIN estudiantes e ON e.id = eda.estudiante_id
      WHERE i.id = ? AND i.deleted_at IS NULL
      LIMIT 1
    `;

        const rows = await sequelize.query(query, {
            replacements: [inscripcionId],
            type: sequelize.QueryTypes.SELECT,
        });
        const row = rows[0];
        if (!row) return null;
        return {
            gestionId: row.gestion_id ?? null,
            estudianteNombre: row.estudiante_nombre ?? null,
        };
    }

    /**
     * Inscripción vigente de un estudiante (gestión con vigente = 1), para precargar
     * la solicitud de licencia desde el buscador de estudiantes. Reutiliza
     * vista_estudiante_inscripcion_actual (1 fila por materia → DISTINCT por inscripción).
     *
     * @param {number} estudianteId
     * @returns {Promise<Object|null>} { inscripcionId, gestionNombre, gestionAnio,
     *   carreraNombre, carreraCodigo, codigoEstudiante } o null si no tiene inscripción vigente.
     */
    async findInscripcionVigenteByEstudiante(estudianteId) {
        const query = `
      SELECT
        inscripcion_id,
        gestion_id,
        gestion_nombre,
        gestion_anio,
        carrera_nombre,
        carrera_codigo,
        codigo_estudiante
      FROM vista_estudiante_inscripcion_actual
      WHERE estudiante_id = ?
        AND gestion_vigente = 1
        AND inscripcion_id IS NOT NULL
      ORDER BY inscripcion_id DESC
      LIMIT 1
    `;

        const rows = await sequelize.query(query, {
            replacements: [estudianteId],
            type: sequelize.QueryTypes.SELECT,
        });
        const row = rows[0];
        if (!row) return null;
        return {
            inscripcionId: row.inscripcion_id,
            gestionNombre: row.gestion_nombre ?? null,
            gestionAnio: row.gestion_anio ?? null,
            carreraNombre: row.carrera_nombre ?? null,
            carreraCodigo: row.carrera_codigo ?? null,
            codigoEstudiante: row.codigo_estudiante ?? null,
        };
    }

    /**
     * Suma de días de licencias APROBADAS de una inscripción (tope 15 días/gestión).
     * Una licencia cuelga de inscripcion_id y la inscripción es de una sola gestión,
     * por lo que sumar por inscripción equivale al tope por gestión del estudiante.
     *
     * @param {number} inscripcionId
     * @param {Object} [opts]
     * @param {number} [opts.excludeId] - Licencia a excluir del conteo (la que se decide).
     * @returns {Promise<number>}
     */
    async sumApprovedDaysByInscripcion(inscripcionId, { excludeId } = {}) {
        const whereConditions = [
            'l.inscripcion_id = ?',
            "l.estado = 'APROBADA'",
            'l.activo = TRUE',
            'l.deleted_at IS NULL',
        ];
        const replacements = [inscripcionId];

        if (excludeId !== undefined && excludeId !== null) {
            whereConditions.push('l.id <> ?');
            replacements.push(excludeId);
        }

        const query = `
      SELECT COALESCE(SUM(l.total_dias), 0) AS total
      FROM licencias l
      WHERE ${whereConditions.join(' AND ')}
    `;

        const rows = await sequelize.query(query, {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        });
        return Number(rows[0]?.total ?? 0);
    }
}

export default LicenseRepository;
