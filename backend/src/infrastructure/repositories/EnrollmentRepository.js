import { IInscripcionRepository } from '../../domain/interfaces/repositories/IInscripcionRepository.js';
import { Inscripcion as InscripcionModel } from '../database/models/inscripcion.js';
import { BaseRepository } from './BaseRepository.js';
import { EnrollmentMapper } from '../mappers/EnrollmentMapper.js';
import { sequelize } from '../database/sequelize.js';

/**
 * Implementación del repositorio de inscripciones usando Sequelize.
 *
 * Convención de capas:
 * IInscripcionRepository → models/inscripcion.js (`inscripciones`)
 * → Enrollment / EnrollmentMapper / EnrollmentRepository
 *
 * @implements {IInscripcionRepository}
 */
export class EnrollmentRepository extends BaseRepository {
    /**
     * Obtiene el modelo Sequelize de inscripciones.
     *
     * @returns {Object} Modelo Inscripcion
     */
    getModel() {
        return InscripcionModel;
    }

    /**
     * Convierte un modelo Sequelize a entidad de dominio.
     *
     * @param {Object} model - Modelo Sequelize
     * @returns {Enrollment|null}
     */
    toEntity(model) {
        return EnrollmentMapper.toEntity(model);
    }

    /**
     * Construye la cláusula WHERE para filtros específicos.
     *
     * Mapeo:
     * - academicDataId   → datosAcademicosId   → datos_academicos_id
     * - managementId     → gestionId           → gestion_id
     * - enrollmentType   → tipoInscripcion     → tipo_inscripcion
     * - enrollmentDate   → fechaInscripcion    → fecha_inscripcion
     * - observations     → observaciones       → observaciones
     *
     * @param {Object} filters
     *   - academicDataId: ID de datos académicos del estudiante
     *   - managementId: ID de la gestión académica
     *   - enrollmentType: Tipo de inscripción
     *   - enrollmentDate: Fecha de inscripción
     *   - observations: Observaciones exactas
     *
     * @returns {Object}
     */
    buildWhereClause(filters = {}) {
        const where = {};

        if (filters.academicDataId) {
            where.datosAcademicosId = filters.academicDataId;
        }

        if (filters.managementId) {
            where.gestionId = filters.managementId;
        }

        if (filters.enrollmentType) {
            where.tipoInscripcion = filters.enrollmentType;
        }

        if (filters.enrollmentDate) {
            where.fechaInscripcion = filters.enrollmentDate;
        }

        if (filters.observations !== undefined) {
            where.observaciones = filters.observations;
        }

        return where;
    }

    /**
     * Campos usados para búsqueda de texto.
     *
     * @returns {string[]}
     */
    getSearchFields() {
        return ['observaciones'];
    }

    /**
     * Orden por defecto.
     *
     * @returns {Array}
     */
    getDefaultSort() {
        return [
            ['fechaInscripcion', 'DESC'],
            ['id', 'DESC'],
        ];
    }

    /**
     * Mapea datos de dominio a formato Sequelize para creación.
     *
     * @param {Enrollment|Object} data
     * @param {number|null} userId
     * @returns {Object}
     */
    mapDataToModel(data, userId = null) {
        return EnrollmentMapper.toModel(data);
    }

    /**
     * Mapea datos de dominio a formato Sequelize para actualización.
     *
     * @param {Enrollment|Object} data
     * @param {number|null} userId
     * @returns {Object}
     */
    mapDataToUpdate(data, userId = null) {
        return EnrollmentMapper.toModelForUpdate(data);
    }

    /**
     * Nombre de la colección en la respuesta JSON.
     *
     * @returns {string}
     */
    getCollectionName() {
        return 'enrollments';
    }

    /**
     * Obtiene inscripción actual del estudiante por gestión desde vista_estudiante_inscripcion_actual.
     * Retorna objetos planos, no entidades.
     *
     * @param {Object} filters
     *   - estudiante_id
     *   - codigo_estudiante
     *   - gestion_id
     *   - inscripcion_id
     *
     * @returns {Promise<Array>}
     */
    async obtenerInscripcionActual(filters = {}) {
        const whereConditions = [];
        const replacements = [];

        if (filters.estudiante_id !== undefined) {
            whereConditions.push('estudiante_id = ?');
            replacements.push(filters.estudiante_id);
        }

        if (filters.codigo_estudiante !== undefined) {
            whereConditions.push('codigo_estudiante = ?');
            replacements.push(filters.codigo_estudiante);
        }

        if (filters.gestion_id !== undefined) {
            whereConditions.push('gestion_id = ?');
            replacements.push(filters.gestion_id);
        }

        if (filters.inscripcion_id !== undefined) {
            whereConditions.push('inscripcion_id = ?');
            replacements.push(filters.inscripcion_id);
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        const query = `
      SELECT *
      FROM vista_estudiante_inscripcion_actual
      ${whereClause}
      ORDER BY inscripcion_id ASC, materia_orden ASC, materia_nombre ASC
    `;

        return sequelize.query(query, {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        });
    }
}