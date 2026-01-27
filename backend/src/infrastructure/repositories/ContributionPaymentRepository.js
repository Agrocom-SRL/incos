import { IContributionPaymentRepository } from '../../domain/interfaces/repositories/IContributionPaymentRepository.js';
import { PagoAporte as PagoAporteModel } from '../database/models/pago_aporte.js';
import { BaseRepository } from './BaseRepository.js';
import { ContributionPaymentMapper } from '../mappers/ContributionPaymentMapper.js';

/**
 * Implementación del repositorio de cabecera de aporte académico (pago_aporte).
 * Utiliza el patrón Template Method heredando de BaseRepository.
 *
 * Una cabecera por (estudiante, gestión). Las cuotas se gestionan en ContributionPaymentInstallmentRepository.
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ContributionPaymentMapper
 *
 * @implements {IContributionPaymentRepository}
 */
export class ContributionPaymentRepository extends BaseRepository {
    /**
     * Obtiene el modelo Sequelize de cabecera de aporte (pago_aporte).
     * @returns {Object} Modelo PagoAporte
     */
    getModel() {
        return PagoAporteModel;
    }

    /**
     * Convierte un modelo Sequelize a entidad de dominio.
     * Delega la responsabilidad de mapeo a ContributionPaymentMapper.
     *
     * @param {Object} model - Modelo Sequelize
     * @returns {ContributionPayment|null} Entidad de dominio
     */
    toEntity(model) {
        return ContributionPaymentMapper.toEntity(model);
    }

    /**
     * Construye la cláusula WHERE para filtros específicos.
     * Maneja todos los criterios de búsqueda de la cabecera de aporte.
     *
     * Ejemplos de uso:
     * - findBy({ studentId: 1, managementId: 2 }) → Cabecera por estudiante y gestión
     * - findAll({ state: 'PENDIENTE' }) → Cabeceras pendientes
     * - findAll({ studentScholarshipId: 5 }) → Cabeceras con beca aplicada
     *
     * @param {Object} filters - Filtros de búsqueda
     *   - studentId: ID del estudiante
     *   - managementId: ID de la gestión académica
     *   - studentScholarshipId: ID de la beca aplicada (estudiantes_becas)
     *   - baseAmount: Monto base del aporte
     *   - scholarshipDiscount: Descuento por beca
     *   - mandatoryAmount: Monto obligatorio a pagar
     *   - state: Estado (PENDIENTE, PARCIAL, CANCELADO)
     * @returns {Object} Objeto WHERE para Sequelize
     */
    buildWhereClause(filters) {
        const where = {};

        if (filters.studentId !== undefined) {
            where.estudianteId = filters.studentId;
        }
        if (filters.managementId !== undefined) {
            where.gestionId = filters.managementId;
        }
        if (filters.studentScholarshipId !== undefined) {
            where.estudianteBecaId = filters.studentScholarshipId;
        }
        if (filters.baseAmount !== undefined) {
            where.montoBase = filters.baseAmount;
        }
        if (filters.scholarshipDiscount !== undefined) {
            where.descuentoBeca = filters.scholarshipDiscount;
        }
        if (filters.mandatoryAmount !== undefined) {
            where.montoObligatorio = filters.mandatoryAmount;
        }
        if (filters.state !== undefined) {
            where.estado = filters.state;
        }

        return where;
    }

    /**
     * Retorna los campos que se usarán para búsqueda de texto en search().
     * La cabecera no tiene campos de texto; el estado es el más representativo para búsqueda.
     *
     * @returns {string[]} Array de nombres de campos del modelo Sequelize
     */
    getSearchFields() {
        return ['estado'];
    }

    /**
     * Retorna el orden por defecto para las consultas.
     * Delega al BaseRepository (id ASC).
     *
     * @returns {Array} Array vacío para usar el orden por defecto del BaseRepository
     */
    getDefaultSort() {
        return [];
    }

    /**
     * Mapea datos de dominio a formato del modelo Sequelize (para creación).
     *
     * @param {ContributionPayment|Object} data - Entidad o objeto con datos de dominio
     * @param {number} userId - ID del usuario que crea
     * @returns {Object} Objeto con formato del modelo Sequelize
     */
    mapDataToModel(data, userId = null) {
        return ContributionPaymentMapper.toModel(data);
    }

    /**
     * Mapea datos de actualización de dominio a formato del modelo Sequelize.
     *
     * @param {ContributionPayment|Object} data - Entidad o objeto con datos de dominio
     * @param {number} userId - ID del usuario que actualiza
     * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
     */
    mapDataToUpdate(data, userId = null) {
        return ContributionPaymentMapper.toModelForUpdate(data);
    }

    /**
     * Retorna el nombre de la colección en la respuesta JSON.
     * @returns {string} Nombre de la colección para la respuesta JSON
     */
    getCollectionName() {
        return 'contributionPayments';
    }

    /**
     * Obtiene el listado de pagos de aportes desde vista_pago_aporte_listado.
     * Fusiona baseFilters + queryParams internamente. COUNT y SELECT vía BaseRepository._queryViewPaged.
     *
     * @param {Object} baseFilters - Filtros base (search, sort) de ListRequestDTO
     * @param {number} page - Página (1-based)
     * @param {number} limit - Límite por página
     * @param {Object} queryParams - Parámetros de query (gestion_id, estudiante_id, estado, etc.)
     * @returns {Promise<{contributionPayments: Array, total: number}>}
     */
    async obtenerListadoPagosAportes(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
        const filters = { ...baseFilters, ...queryParams };

        const whereConditions = [];
        const replacements = [];

        if (filters.estudiante_id !== undefined) {
            whereConditions.push('estudiante_id = ?');
            replacements.push(filters.estudiante_id);
        }
        if (filters.gestion_id !== undefined) {
            whereConditions.push('gestion_id = ?');
            replacements.push(filters.gestion_id);
        }
        if (filters.estado !== undefined) {
            whereConditions.push('estado = ?');
            replacements.push(filters.estado);
        }
        if (filters.search && typeof filters.search === 'string') {
            const term = `%${filters.search.trim()}%`;
            whereConditions.push(
                '(codigo_estudiante LIKE ? OR estudiante_nombres LIKE ? OR estudiante_apellido_paterno LIKE ? OR estudiante_apellido_materno LIKE ? OR gestion_nombre LIKE ?)'
            );
            replacements.push(term, term, term, term, term);
        }

        const orderClause = this._orderClauseForListado(filters.sort);

        const { rows, total } = await this._queryViewPaged(
            'vista_pago_aporte_listado',
            whereConditions,
            replacements,
            orderClause,
            page,
            limit
        );

        return { contributionPayments: rows, total };
    }

    /**
     * Orden para vista_pago_aporte_listado. Whitelist de columnas.
     * @private
     */
    _orderClauseForListado(sort) {
        const allowed = ['id', 'estado', 'created_at', 'gestion_anio', 'total_pagado', 'cantidad_pagos', 'saldo_pendiente', 'codigo_estudiante', 'gestion_nombre'];
        if (!sort || typeof sort !== 'string') return 'ORDER BY id ASC';
        const [field, dir] = sort.trim().split(':');
        const col = (field || 'id').toLowerCase();
        const direction = (dir || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        return allowed.includes(col) ? `ORDER BY ${col} ${direction}` : 'ORDER BY id ASC';
    }
}
