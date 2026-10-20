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

    /**
     * Listado de matrículas desde vista_base_matricula_resumen_inscripcion.
     *
     * @param {Object} baseFilters - Filtros base (search, sort) de ListRequestDTO
     * @param {number} page - Página (1-based)
     * @param {number} limit - Límite por página
     * @param {Object} queryParams - Filtros adicionales (gestion_id, carrera_id, paralelo_id, periodo_id, tipo_inscripcion, historial_previo_estado, estudiante_id)
     * @returns {Promise<{enrollments: Array, total: number}>}
     */
    async obtenerListadoMatriculas(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
        const filters = { ...baseFilters, ...queryParams };

        const whereConditions = [];
        const replacements = [];

        if (filters.gestion_id !== undefined) {
            whereConditions.push('gestion_id = ?');
            replacements.push(filters.gestion_id);
        }
        if (filters.carrera_id !== undefined) {
            whereConditions.push('carrera_id = ?');
            replacements.push(filters.carrera_id);
        }
        if (filters.paralelo_id !== undefined) {
            whereConditions.push('paralelo_id = ?');
            replacements.push(filters.paralelo_id);
        }
        if (filters.periodo_id !== undefined) {
            whereConditions.push('periodo_id = ?');
            replacements.push(filters.periodo_id);
        }
        if (
            filters.historial_previo_estado !== undefined &&
            String(filters.historial_previo_estado).trim() !== ''
        ) {
            const estadosHistorial = new Set(['NO_APLICA', 'REGISTRADO', 'PENDIENTE']);
            const estadoHist = String(filters.historial_previo_estado).trim().toUpperCase();
            if (estadosHistorial.has(estadoHist)) {
                whereConditions.push('historial_previo_estado = ?');
                replacements.push(estadoHist);
            }
        }
        if (filters.estudiante_id !== undefined) {
            whereConditions.push('estudiante_id = ?');
            replacements.push(filters.estudiante_id);
        }
        if (filters.tipo_inscripcion !== undefined && String(filters.tipo_inscripcion).trim() !== '') {
            whereConditions.push('tipo_inscripcion = ?');
            replacements.push(String(filters.tipo_inscripcion).trim().toUpperCase());
        }
        if (filters.enrollment_type !== undefined && String(filters.enrollment_type).trim() !== '') {
            whereConditions.push('tipo_inscripcion = ?');
            replacements.push(String(filters.enrollment_type).trim().toUpperCase());
        }
        if (filters.search && typeof filters.search === 'string' && filters.search.trim() !== '') {
            const term = `%${filters.search.trim()}%`;
            whereConditions.push(
                '(estudiante_nombre_completo LIKE ? OR codigo_estudiante LIKE ? OR estudiante_ci LIKE ? OR carrera_nombre LIKE ? OR carrera_codigo LIKE ? OR gestion_nombre LIKE ? OR CAST(gestion_anio AS CHAR) LIKE ? OR paralelo_nombre LIKE ? OR periodo_nombre LIKE ?)'
            );
            replacements.push(term, term, term, term, term, term, term, term, term);
        }

        const orderClause = this._orderClauseForMatriculaListado(filters.sort);

        const { rows, total } = await this._queryViewPaged(
            'vista_base_matricula_resumen_inscripcion',
            whereConditions,
            replacements,
            orderClause,
            page,
            limit
        );

        return { enrollments: rows, total };
    }

    /**
     * Orden para vista_base_matricula_resumen_inscripcion.
     * @private
     */
    _orderClauseForMatriculaListado(sort) {
        const allowed = [
            'inscripcion_id',
            'fecha_inscripcion',
            'tipo_inscripcion',
            'created_at',
            'gestion_anio',
            'carrera_nombre',
            'codigo_estudiante',
            'cantidad_materias',
            'cantidad_historial_previo',
            'paralelo_nombre',
            'periodo_numero',
            'historial_previo_estado',
        ];

        if (!sort || typeof sort !== 'string') {
            return 'ORDER BY fecha_inscripcion DESC, inscripcion_id DESC';
        }

        const [field, dir] = sort.split(':');
        const direction = (dir || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        const sortField = field === 'id' ? 'inscripcion_id' : field;
        if (sortField && allowed.includes(sortField)) {
            return `ORDER BY ${sortField} ${direction}, inscripcion_id DESC`;
        }

        return 'ORDER BY fecha_inscripcion DESC, inscripcion_id DESC';
    }
}
