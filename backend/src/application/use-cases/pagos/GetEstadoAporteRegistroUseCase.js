/**
 * Use Case: GetEstadoAporteRegistroUseCase
 * Módulo: Pagos
 * Obtiene el estado actual del aporte de un estudiante para el formulario de registro de pago.
 *
 * Retorna: cabecera (si existe), total_pagado, cantidad_pagos, saldo_pendiente, cuotas ya pagadas,
 * tiene_descuento_aplicado y gestión. Si no hay cabecera, calcula monto_obligatorio desde
 * configuracion_aportes + beca activa (sin crear cabecera).
 *
 * Uso: GET /pagos-aportes/estado-registro?estudiante_id=&gestion_id= (gestion_id opcional; si no se envía, se usa la vigente).
 */
import { ValidationError } from '../../../domain/errors/AppError.js';

export class GetEstadoAporteRegistroUseCase {
    /**
     * @param {Object} params - Dependencias inyectadas
     * @param {Object} params.contributionPaymentRepository - Repositorio de cabecera (pago_aporte)
     * @param {Object} params.contributionPaymentInstallmentRepository - Repositorio de cuotas (pago_cuotas)
     * @param {Object} params.managementRepository - Repositorio de gestiones
     * @param {Object} params.contributionConfigurationRepository - Repositorio de configuraciones de aportes
     * @param {Object} params.studentScholarshipRepository - Repositorio de becas de estudiantes
     * @param {Object} params.scholarshipRepository - Repositorio de tipos de beca
     * @param {ILogger} params.logger - Logger
     */
    constructor({
        contributionPaymentRepository,
        contributionPaymentInstallmentRepository,
        managementRepository,
        contributionConfigurationRepository,
        studentScholarshipRepository,
        scholarshipRepository,
        logger,
    }) {
        this.contributionPaymentRepository = contributionPaymentRepository;
        this.contributionPaymentInstallmentRepository = contributionPaymentInstallmentRepository;
        this.managementRepository = managementRepository;
        this.contributionConfigurationRepository = contributionConfigurationRepository;
        this.studentScholarshipRepository = studentScholarshipRepository;
        this.scholarshipRepository = scholarshipRepository;
        this.logger = logger;
    }

    /**
     * Ejecuta el caso de uso.
     *
     * @param {Object} params
     * @param {number} params.studentId - ID del estudiante (requerido)
     * @param {number} [params.managementId] - ID de la gestión (opcional; si no se envía, se usa la vigente)
     * @returns {Promise<Object>} Estado del aporte para el formulario de registro
     */
    async execute({ studentId, managementId: managementIdParam }) {
        if (!studentId) {
            throw new ValidationError('El ID del estudiante es requerido');
        }

        const managementId = managementIdParam != null && managementIdParam !== ''
            ? Number(managementIdParam)
            : null;

        const management = managementId
            ? await this._getManagementById(managementId)
            : await this._getCurrentManagement();

        const mgmtId = management?.id ?? management?.toPlainObject?.()?.id ?? managementId;

        let cabecera = await this.contributionPaymentRepository.findBy({
            studentId: Number(studentId),
            managementId: mgmtId,
        });

        if (cabecera) {
            return this._buildResponseWithCabecera(cabecera, management);
        }

        return this._buildResponseSinCabecera(Number(studentId), mgmtId, management);
    }

    /**
     * @private
     */
    async _getManagementById(managementId) {
        const m = await this.managementRepository.findById(managementId);
        if (!m) {
            throw new ValidationError(`Gestión con ID ${managementId} no encontrada`);
        }
        return m;
    }

    /**
     * @private
     */
    async _getCurrentManagement() {
        const m = await this.managementRepository.findBy({ vigente: true, isActive: true });
        if (!m) {
            throw new ValidationError('No hay una gestión vigente configurada en el sistema');
        }
        return m;
    }

    /**
     * @private
     */
    async _buildResponseWithCabecera(cabecera, management) {
        const plain = cabecera.toPlainObject ? cabecera.toPlainObject() : cabecera;
        const cabeceraId = plain.id ?? cabecera.id;

        const result = await this.contributionPaymentInstallmentRepository.findAll(
            { contributionPaymentId: cabeceraId },
            1,
            5000
        );
        const list = result.contributionPaymentInstallments || result.contributionPaymentInstallment || [];
        let totalPagado = 0;
        const cuotas = [];
        for (const c of list) {
            const p = c.toPlainObject ? c.toPlainObject() : c;
            const monto = Number(p.amount ?? p.monto ?? 0) || 0;
            totalPagado += monto;
            cuotas.push({
                id: p.id,
                numero_recibo: p.receiptNumber ?? p.numeroRecibo ?? p.numero_recibo,
                fecha_pago: p.paymentDate ?? p.fechaPago ?? p.fecha_pago,
                monto,
                metodo_pago_id: p.paymentMethodId ?? p.metodoPagoId ?? p.metodo_pago_id,
            });
        }

        const montoObligatorio = Number(plain.mandatoryAmount ?? plain.montoObligatorio ?? 0);
        const saldoPendiente = Math.max(0, montoObligatorio - totalPagado);
        const tieneDescuentoAplicado = !!(plain.studentScholarshipId ?? plain.estudianteBecaId ?? plain.estudiante_beca_id) ||
            (Number(plain.scholarshipDiscount ?? plain.descuentoBeca ?? plain.descuento_beca ?? 0) > 0);

        const gestionPlain = management?.toPlainObject ? management.toPlainObject() : management || {};

        return {
            cabecera: {
                id: plain.id,
                estudiante_id: plain.studentId ?? plain.estudianteId,
                gestion_id: plain.managementId ?? plain.gestionId,
                monto_base: Number(plain.baseAmount ?? plain.montoBase ?? 0),
                descuento_beca: Number(plain.scholarshipDiscount ?? plain.descuentoBeca ?? 0),
                monto_obligatorio: montoObligatorio,
                estado: plain.state ?? plain.estado,
            },
            gestion: {
                id: gestionPlain.id,
                nombre: gestionPlain.nombre ?? gestionPlain.name,
                anio: gestionPlain.anio ?? gestionPlain.year,
            },
            total_pagado: totalPagado,
            cantidad_pagos: cuotas.length,
            saldo_pendiente: saldoPendiente,
            monto_obligatorio: montoObligatorio,
            monto_base: Number(plain.baseAmount ?? plain.montoBase ?? 0),
            descuento_beca: Number(plain.scholarshipDiscount ?? plain.descuentoBeca ?? 0),
            tiene_descuento_aplicado: tieneDescuentoAplicado,
            cuotas,
        };
    }

    /**
     * @private
     */
    async _buildResponseSinCabecera(studentId, managementId, management) {
        const config = await this._getActiveContributionConfiguration(managementId);
        const montoBase = config?.montoBase ?? config?.baseAmount ?? 400;
        const { scholarshipDiscount, studentScholarshipId } = await this._calculateScholarshipDiscount(studentId, managementId, montoBase);
        const montoObligatorio = Math.max(0, montoBase - scholarshipDiscount);
        const tieneDescuentoAplicado = !!(studentScholarshipId && scholarshipDiscount > 0);

        const gestionPlain = management?.toPlainObject ? management.toPlainObject() : management || {};

        return {
            cabecera: null,
            gestion: {
                id: gestionPlain.id,
                nombre: gestionPlain.nombre ?? gestionPlain.name,
                anio: gestionPlain.anio ?? gestionPlain.year,
            },
            total_pagado: 0,
            cantidad_pagos: 0,
            saldo_pendiente: montoObligatorio,
            monto_obligatorio: montoObligatorio,
            monto_base: montoBase,
            descuento_beca: scholarshipDiscount,
            tiene_descuento_aplicado: tieneDescuentoAplicado,
            cuotas: [],
        };
    }

    /**
     * @private
     */
    async _getActiveContributionConfiguration(managementId) {
        try {
            const result = await this.contributionConfigurationRepository.findAll(
                { managementId, contributionActive: true },
                1,
                1
            );
            const list = result?.contributionConfigurations ?? result?.configuracionesAportes ?? [];
            return Array.isArray(list) && list[0] ? list[0] : null;
        } catch {
            return null;
        }
    }

    /**
     * @private
     */
    async _calculateScholarshipDiscount(studentId, managementId, totalAmount) {
        const activeScholarship = await this.studentScholarshipRepository.findBy({
            studentId,
            managementId,
            estado: 'ACTIVA',
        });
        if (!activeScholarship) {
            return { scholarshipDiscount: 0, studentScholarshipId: null };
        }
        const scholarshipId = activeScholarship.scholarshipId ?? activeScholarship.becaDescuentoId ?? activeScholarship.beca_descuento_id;
        if (!scholarshipId) {
            return { scholarshipDiscount: 0, studentScholarshipId: activeScholarship.id };
        }
        const scholarship = await this.scholarshipRepository.findById(scholarshipId);
        const percentage = scholarship?.percentage ?? scholarship?.porcentaje ?? 0;
        const discount = totalAmount * (Number(percentage) / 100);
        return {
            scholarshipDiscount: parseFloat(discount.toFixed(2)),
            studentScholarshipId: activeScholarship.id,
        };
    }
}
