import path from 'path';
import fs from 'fs';
import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { UploadsStorageHelper } from '../../../infrastructure/external/storage/UploadsStorageHelper.js';
import { ESTADOS_PAGO_APORTE } from '../../../domain/constants/pagos.constants.js';

/**
 * Plazo institucional POR DEFECTO (en días) del compromiso de pago que se genera
 * automáticamente al registrar la PRIMERA cuota del aporte: la fecha comprometida
 * es fecha_pago_de_la_cuota + DIAS_COMPROMISO. Se usa cuando el frontend no envía
 * un plazo válido (ver DIAS_COMPROMISO_PERMITIDOS).
 */
const DIAS_COMPROMISO = 90;

/**
 * Plazos (en días) que el usuario puede elegir al registrar la primera cuota:
 * 2 semanas, 1 mes, 1 mes y medio, 2 meses, 3 meses. Cualquier valor fuera de
 * esta lista se ignora y se cae al plazo por defecto (DIAS_COMPROMISO).
 */
const DIAS_COMPROMISO_PERMITIDOS = [15, 30, 45, 60, 90];

/**
 * Use Case: RegisterAporteVoluntarioUseCase
 * Módulo: Pagos Académicos
 * Registra una cuota (abono) del aporte académico de un estudiante.
 *
 * Modelo: cabecera (pago_aporte) + cuotas (pago_cuotas).
 * - Cada registro es una cuota en pago_cuotas con metodo, fecha, monto, codigo_comprobante, etc.
 * - La cabecera pago_aporte se obtiene o crea por (estudiante, gestión); estado se actualiza:
 *   PENDIENTE → primera cuota → PARCIAL; si total_pagado >= monto_obligatorio → CANCELADO.
 *
 * APLICACIÓN DEL DESCUENTO POR BECA (en la cabecera):
 * - monto_base, descuento_beca, monto_obligatorio en pago_aporte.
 * - Cada cuota tiene su monto; la suma de cuotas no puede superar monto_obligatorio.
 */
export class RegisterAporteVoluntarioUseCase {
    /**
     * @param {Object} params - Dependencias inyectadas
     * @param {Object} params.contributionPaymentRepository - Repositorio de cabecera (pago_aporte)
     * @param {Object} params.contributionPaymentInstallmentRepository - Repositorio de cuotas (pago_cuotas)
     * @param {Object} params.paymentMethodRepository - Repositorio de métodos de pago
     * @param {Object} params.studentRepository - Repositorio de estudiantes
     * @param {Object} params.studentScholarshipRepository - Repositorio de becas de estudiantes
     * @param {Object} params.scholarshipRepository - Repositorio de tipos de beca/descuento
     * @param {Object} params.managementRepository - Repositorio de gestiones académicas
     * @param {Object} params.contributionConfigurationRepository - Repositorio de configuraciones de aportes
     * @param {Object} params.studentDocumentRepository - Repositorio de documentos de estudiantes
     * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
     * @param {Object} params.upsertCompromisoUseCase - Use case para crear/renegociar el compromiso de pago vigente
     * @param {Object} params.compromisoPagoRepository - Repositorio de compromisos de pago (para marcar CUMPLIDO al saldar)
     * @param {Object} params.pdfGenerator - Generador de PDFs (PDFGenerator)
     * @param {ILogger} params.logger - Logger para registro de eventos
     */
    constructor({
        contributionPaymentRepository,
        contributionPaymentInstallmentRepository,
        paymentMethodRepository,
        studentRepository,
        studentScholarshipRepository,
        scholarshipRepository,
        managementRepository,
        contributionConfigurationRepository,
        studentDocumentRepository,
        studentDocumentDeliveryRepository,
        upsertCompromisoUseCase,
        compromisoPagoRepository,
        pdfGenerator,
        logger,
    }) {
        this.contributionPaymentRepository = contributionPaymentRepository;
        this.contributionPaymentInstallmentRepository = contributionPaymentInstallmentRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.studentRepository = studentRepository;
        this.studentScholarshipRepository = studentScholarshipRepository;
        this.scholarshipRepository = scholarshipRepository;
        this.managementRepository = managementRepository;
        this.contributionConfigurationRepository = contributionConfigurationRepository;
        this.studentDocumentRepository = studentDocumentRepository;
        this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
        this.upsertCompromisoUseCase = upsertCompromisoUseCase;
        this.compromisoPagoRepository = compromisoPagoRepository;
        this.pdfGenerator = pdfGenerator;
        this.logger = logger;
    }

    /**
     * Ejecuta el caso de uso: registrar una cuota (abono) del aporte.
     *
     * Flujo: 1) Validar estudiante y gestión; 2) Obtener o crear cabecera pago_aporte;
     * 3) Validar monto <= saldo restante y método de pago; 4) Insertar pago_cuotas;
     * 5) Actualizar pago_aporte.estado (PARCIAL/CANCELADO); 6) Generar recibo PDF; 7) Guardar documentos.
     *
     * @param {Object} data - Datos de la cuota (snake_case desde frontend)
     * @param {number} data.student_id - ID del estudiante (requerido)
     * @param {number} [data.management_id] - ID de la gestión (opcional; si no se envía, se usa la gestión vigente)
     * @param {number} data.amount - Monto de esta cuota (requerido, > 0 salvo pago gratuito)
     * @param {number} data.payment_method_id - ID del método de pago (requerido)
     * @param {number|null} data.payment_account_id - ID de la cuenta (NULL para EFECTIVO)
     * @param {string} data.payment_date - Fecha del pago YYYY-MM-DD (requerido)
     * @param {string} [data.transaction_number] - Número de transacción (opcional)
     * @param {string} [data.codigo_comprobante] - Código comprobante (requerido para QR/TRANSFERENCIA/DEPOSITO)
     * @param {string} [data.descripcion] - Descripción (opcional)
     * @returns {Promise<Object>} { payment: cuota creada, reciboPDF?, reciboDocument?, document?, documentDelivery? }
     */
    async execute(data) {
        const studentId = data.student_id ?? data.studentId;
        const amount = data.amount != null ? Number(data.amount) : undefined;
        const paymentMethodId = data.payment_method_id ?? data.paymentMethodId;
        const paymentAccountId = data.payment_account_id ?? data.paymentAccountId ?? null;
        const paymentDate = data.payment_date ?? data.paymentDate;
        const transactionNumber = data.transaction_number ?? data.transactionNumber ?? null;
        const codigoComprobante = data.codigo_comprobante ?? data.codigoComprobante ?? null;
        const descripcion = data.descripcion ?? data.description ?? null;
        // Plazo del compromiso elegido en el formulario (solo aplica en la 1ra cuota).
        const diasCompromiso = this._resolveDiasCompromiso(data.compromiso_dias ?? data.compromisoDias);

        if (!paymentDate) {
            throw new ValidationError('La fecha de pago es requerida');
        }

        this.logger.info('[Pagos] Registrando cuota de aporte', { studentId, amount });

        try {
            const student = await this._validateStudent(studentId);
            const management = await this._getManagementForPayment(data.management_id ?? data.managementId);
            const managementId = management.id ?? management.toPlainObject?.().id;

            const cabecera = await this._getOrCreateCabecera(studentId, managementId);

            const totalPagado = await this._totalPagadoCabecera(cabecera.id);
            const montoObligatorio = Number(cabecera.mandatoryAmount ?? cabecera.montoObligatorio ?? 0);
            const saldoRestante = Math.max(0, montoObligatorio - totalPagado);

            if (amount != null && amount < 0) {
                throw new ValidationError('El monto de la cuota no puede ser negativo');
            }
            const montoCuota = amount != null ? Number(amount) : 0;
            if (montoCuota > saldoRestante) {
                throw new ValidationError(
                    `El monto de la cuota (Bs. ${montoCuota.toFixed(2)}) no puede superar el saldo pendiente (Bs. ${saldoRestante.toFixed(2)})`
                );
            }

            const esPagoGratuito = montoCuota === 0;
            const esMetodoEfectivo = paymentMethodId === 1;
            let paymentMethod = null;
            if (esPagoGratuito && esMetodoEfectivo) {
                paymentMethod = await this.paymentMethodRepository.findById(1).catch(() => null);
            } else {
                paymentMethod = await this._validatePaymentMethod(paymentMethodId, paymentAccountId, transactionNumber, codigoComprobante);
            }

            const finalPaymentMethodId = (esPagoGratuito && esMetodoEfectivo) ? 1 : paymentMethodId;
            const finalPaymentAccountId = (esPagoGratuito && esMetodoEfectivo) ? null : paymentAccountId;
            const finalTransactionNumber = (esPagoGratuito && esMetodoEfectivo) ? null : transactionNumber;
            const finalCodigoComprobante = (esPagoGratuito && esMetodoEfectivo) ? null : (codigoComprobante ?? null);

            // Crear cuota con numero_recibo temporal (NOT NULL); luego se reemplaza por ID a 6 dígitos (unicidad en lógica)
            const cuotaData = {
                contributionPaymentId: cabecera.id,
                receiptNumber: `TEMP-${cabecera.id}-${Date.now()}`,
                paymentDate,
                amount: montoCuota,
                paymentMethodId: finalPaymentMethodId,
                paymentAccountId: finalPaymentAccountId,
                transactionNumber: finalTransactionNumber,
                comprobanteCode: finalCodigoComprobante,
                description: descripcion ?? null,
            };

            const cuota = await this.contributionPaymentInstallmentRepository.create(cuotaData);

            // Número de recibo definitivo: ID de pago_cuotas rellenado a 6 dígitos (ej. 7 → "000007")
            const numeroRecibo = String(cuota.id).padStart(6, '0');
            await this.contributionPaymentInstallmentRepository.update(cuota.id, { receiptNumber: numeroRecibo });

            const nuevoTotalPagado = totalPagado + montoCuota;
            let nuevoEstado = cabecera.state ?? cabecera.estado;
            if (nuevoTotalPagado >= montoObligatorio) {
                nuevoEstado = ESTADOS_PAGO_APORTE.CANCELADO;
            } else if ((cabecera.state ?? cabecera.estado) === ESTADOS_PAGO_APORTE.PENDIENTE) {
                nuevoEstado = ESTADOS_PAGO_APORTE.PARCIAL;
            }
            await this.contributionPaymentRepository.update(cabecera.id, { state: nuevoEstado });

            // Compromiso de pago (plazo institucional hardcodeado = DIAS_COMPROMISO):
            // - Primera cuota (no había pagos previos en la cabecera): se auto-genera el
            //   compromiso con fecha = fecha_pago_de_la_cuota + DIAS_COMPROMISO.
            // - Si la cuota deja el aporte CANCELADO (saldo 0): el compromiso vigente
            //   pasa a 'CUMPLIDO'.
            // Cualquier fallo aquí NO debe romper el registro del pago.
            await this._gestionarCompromiso({
                cabeceraId: cabecera.id,
                esPrimeraCuota: totalPagado === 0,
                quedaCancelado: nuevoEstado === ESTADOS_PAGO_APORTE.CANCELADO,
                paymentDate,
                diasCompromiso,
                userId: data.userId ?? data.usuarioId ?? null,
            });

            let reciboPDF = null;
            let savedReciboDocument = null;
            const totalAmount = Number(cabecera.baseAmount ?? cabecera.montoBase ?? 0);
            const scholarshipDiscount = Number(cabecera.scholarshipDiscount ?? cabecera.descuentoBeca ?? 0);
            const scholarshipInfo = null;
            const saldoPendienteDespues = Math.max(0, montoObligatorio - nuevoTotalPagado);

            // Generar PDF y guardar en documentos_estudiante antes de responder para que el frontend pueda descargar el recibo antes de navegar.
            if (this.pdfGenerator) {
                try {
                    const reciboResult = await this._generateReciboPDF(
                        cuota,
                        student,
                        management,
                        paymentMethod,
                        scholarshipInfo,
                        totalAmount,
                        scholarshipDiscount,
                        montoCuota,
                        totalPagado,
                        saldoPendienteDespues,
                        montoObligatorio
                    );
                    reciboPDF = reciboResult?.filePath ?? null;
                    if (reciboResult?.filePath && reciboResult?.fileName) {
                        savedReciboDocument = await this._saveReciboDocument(
                            studentId,
                            reciboResult.fileName,
                            reciboResult.absolutePath,
                            reciboResult.filePath
                        ).catch((err) => {
                            this.logger.error('[Pagos] Error al guardar recibo en BD', { error: err.message });
                            return null;
                        });
                    }
                } catch (pdfError) {
                    this.logger.error('[Pagos] Error al generar recibo PDF', { error: pdfError?.message });
                }
            }

            let savedDocument = null;
            let savedDocumentDelivery = null;
            if (data.documentFile) {
                savedDocument = await this._savePaymentDocument(studentId, cuota.id, data.documentFile);
                if (savedDocument) {
                    savedDocumentDelivery = await this._savePaymentDocumentDelivery(studentId, savedDocument.id, paymentDate, descripcion);
                }
            }

            const paymentPlain = cuota.toPlainObject ? cuota.toPlainObject() : { ...cuota };
            paymentPlain.receiptNumber = numeroRecibo; // Número definitivo (ID a 6 dígitos)
            const result = { payment: paymentPlain };
            if (reciboPDF) result.reciboPDF = reciboPDF;
            if (savedReciboDocument) result.reciboDocument = savedReciboDocument.toPlainObject ? savedReciboDocument.toPlainObject() : savedReciboDocument;
            if (savedDocument) result.document = savedDocument.toPlainObject ? savedDocument.toPlainObject() : savedDocument;
            if (savedDocumentDelivery) result.documentDelivery = savedDocumentDelivery.toPlainObject ? savedDocumentDelivery.toPlainObject() : savedDocumentDelivery;

            return result;
        } catch (error) {
            this.logger.error('[Pagos] Error al registrar cuota', { error: error.message, stack: error.stack, data });
            throw error;
        }
    }

    /**
     * Gestiona el compromiso de pago de la cabecera tras registrar una cuota.
     * Nunca lanza: un fallo se registra con logger.warn y no rompe el pago.
     *
     * @private
     * @param {Object} params
     * @param {number} params.cabeceraId - ID de pago_aporte (cabecera)
     * @param {boolean} params.esPrimeraCuota - true si la cabecera no tenía cuotas previas
     * @param {boolean} params.quedaCancelado - true si el aporte quedó CANCELADO (saldo 0)
     * @param {string} params.paymentDate - Fecha de la cuota (YYYY-MM-DD)
     * @param {number} [params.diasCompromiso] - Plazo elegido (días) para el compromiso
     * @param {number|null} params.userId - Usuario que registra (auditoría)
     */
    async _gestionarCompromiso({ cabeceraId, esPrimeraCuota, quedaCancelado, paymentDate, diasCompromiso = DIAS_COMPROMISO, userId }) {
        try {
            // 1) Primera cuota que NO salda el aporte → auto-crear compromiso a
            //    `diasCompromiso` días de la fecha de pago. Si la primera cuota ya
            //    cancela todo (p. ej. beca 100% o pago único total) no hay compromiso.
            if (esPrimeraCuota && !quedaCancelado && this.upsertCompromisoUseCase) {
                const fechaCompromiso = this._addDays(paymentDate, diasCompromiso);
                if (fechaCompromiso) {
                    await this.upsertCompromisoUseCase.execute({
                        pagoAporteId: cabeceraId,
                        data: {
                            fechaCompromiso,
                            observacion: `Generado automáticamente al registrar la primera cuota (plazo de ${diasCompromiso} días)`,
                        },
                        userId,
                    });
                    this.logger.info('[Pagos] Compromiso de pago auto-generado en la primera cuota', {
                        cabeceraId,
                        fechaCompromiso,
                        diasCompromiso,
                    });
                }
            }

            // 2) El aporte quedó saldado → marcar el compromiso vigente como CUMPLIDO.
            if (quedaCancelado && this.compromisoPagoRepository) {
                const vigente = await this.compromisoPagoRepository.findVigenteByPagoAporteId(cabeceraId);
                if (vigente) {
                    await this.compromisoPagoRepository.update(vigente.id, { estado: 'CUMPLIDO' }, userId);
                    this.logger.info('[Pagos] Compromiso de pago marcado como CUMPLIDO (aporte saldado)', {
                        cabeceraId,
                        compromisoId: vigente.id,
                    });
                }
            }
        } catch (error) {
            this.logger.warn('[Pagos] No se pudo gestionar el compromiso de pago (no bloquea el registro)', {
                cabeceraId,
                error: error.message,
            });
        }
    }

    /**
     * Normaliza el plazo del compromiso recibido del frontend: solo acepta los
     * valores de DIAS_COMPROMISO_PERMITIDOS; cualquier otro cae al plazo por defecto.
     * @private
     * @param {*} value - Valor crudo del body (compromiso_dias / compromisoDias)
     * @returns {number} Plazo en días válido
     */
    _resolveDiasCompromiso(value) {
        const n = Number(value);
        if (Number.isFinite(n) && DIAS_COMPROMISO_PERMITIDOS.includes(n)) {
            return n;
        }
        return DIAS_COMPROMISO;
    }

    /**
     * Suma días a una fecha YYYY-MM-DD y devuelve YYYY-MM-DD (o null si entrada inválida).
     * @private
     */
    _addDays(dateStr, days) {
        const str = String(dateStr ?? '').slice(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) {
            return null;
        }
        const d = new Date(`${str}T00:00:00`);
        if (Number.isNaN(d.getTime())) {
            return null;
        }
        d.setDate(d.getDate() + Number(days));
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    /**
     * Obtiene la gestión a usar para el pago: si se envía management_id se usa esa;
     * si no, se recupera la gestión vigente.
     * @private
     */
    async _getManagementForPayment(managementIdFromRequest) {
        if (managementIdFromRequest != null && managementIdFromRequest !== '') {
            return this._getManagementById(Number(managementIdFromRequest));
        }
        return this._getCurrentManagement();
    }

    /**
     * Obtiene la gestión por ID.
     * @private
     */
    async _getManagementById(managementId) {
        const m = await this.managementRepository.findById(managementId);
        if (!m) {
            throw new NotFoundError(`Gestión con ID ${managementId} no encontrada`);
        }
        return m;
    }

    /**
     * Obtiene o crea la cabecera pago_aporte para (estudiante, gestión).
     * @private
     */
    async _getOrCreateCabecera(studentId, managementId) {
        let cabecera = await this.contributionPaymentRepository.findBy({
            studentId,
            managementId,
            activo: true,
        });
        if (cabecera) {
            return cabecera;
        }
        const config = await this._getActiveContributionConfiguration(managementId);
        const totalAmount = config?.montoBase ?? config?.baseAmount ?? 400;
        const { scholarshipDiscount, studentScholarshipId } = await this._calculateScholarshipDiscount(studentId, managementId, totalAmount);
        const montoObligatorio = Math.max(0, totalAmount - scholarshipDiscount);

        const cabeceraData = {
            studentId,
            managementId,
            studentScholarshipId,
            baseAmount: totalAmount,
            scholarshipDiscount,
            mandatoryAmount: montoObligatorio,
            state: ESTADOS_PAGO_APORTE.PENDIENTE,
        };
        cabecera = await this.contributionPaymentRepository.create(cabeceraData);
        this.logger.info('[Pagos] Cabecera pago_aporte creada', { studentId, managementId, cabeceraId: cabecera.id });
        return cabecera;
    }

    /**
     * Suma el total pagado (monto) de las cuotas activas de una cabecera.
     * @private
     */
    async _totalPagadoCabecera(cabeceraId) {
        const result = await this.contributionPaymentInstallmentRepository.findAll(
            { contributionPaymentId: cabeceraId },
            null,
            { limit: 5000 }
        );
        const list = result.contributionPaymentInstallments || result.contributionPaymentInstallment || [];
        let sum = 0;
        for (const c of list) {
            const plain = c.toPlainObject ? c.toPlainObject() : c;
            sum += Number(plain.amount ?? plain.monto ?? 0) || 0;
        }
        return sum;
    }

    /**
     * Valida que el estudiante exista
     * @private
     * @param {number} studentId - ID del estudiante
     * @returns {Promise<Object>} Entidad Student
     * @throws {NotFoundError} Si el estudiante no existe
     */
    async _validateStudent(studentId) {
        if (!studentId) {
            throw new ValidationError('El ID del estudiante es requerido');
        }

        const student = await this.studentRepository.findById(studentId);
        if (!student) {
            throw new NotFoundError(`Estudiante con ID ${studentId}`);
        }

        return student;
    }

    /**
     * Obtiene la gestión vigente actual
     * @private
     * @returns {Promise<Object>} Gestión vigente
     * @throws {ValidationError} Si no hay gestión vigente
     */
    async _getCurrentManagement() {
        const management = await this.managementRepository.findBy({
            vigente: true, // Solo gestiones vigentes
            activo: true,
        });

        if (!management) {
            throw new ValidationError('No hay una gestión vigente configurada en el sistema');
        }

        return management;
    }

    /**
     * Obtiene la configuración de aporte activa para la gestión
     * @private
     * @param {number} managementId - ID de la gestión
     * @returns {Promise<Object|null>} Configuración de aporte activa o null
     */
    async _getActiveContributionConfiguration(managementId) {
        try {
            // Buscar configuración activa (aporte_activo = true) para esta gestión
            const result = await this.contributionConfigurationRepository.findAll(
                {
                    managementId,
                    contributionActive: true,
                    active: true,
                },
                null,
                { limit: 1 }
            );

            const configuracionAporte = result?.configuracionesAportes?.[0] || null;

            if (!configuracionAporte) {
                this.logger.warn('[Pagos] No se encontró configuración de aporte activa', {
                    managementId,
                });
                return null;
            }

            this.logger.info('[Pagos] Configuración de aporte obtenida', {
                configuracionAporteId: configuracionAporte.id,
                montoBase: configuracionAporte.montoBase || configuracionAporte.baseAmount,
                managementId,
            });

            return configuracionAporte;
        } catch (error) {
            this.logger.error('[Pagos] Error al obtener configuración de aporte', {
                error: error.message,
                managementId,
            });
            // No fallar si no se puede obtener, usar valor por defecto
            return null;
        }
    }

    /**
     * Valida que no exista un pago previo del estudiante para la gestión actual
     * REGLA DE NEGOCIO: Un estudiante solo puede pagar UNA VEZ por gestión académica
     *
     * @private
     * @param {number} studentId - ID del estudiante
     * @param {number} managementId - ID de la gestión
     * @throws {ValidationError} Si ya existe un pago para esta gestión
     */
    async _validateNoDuplicatePayment(studentId, managementId) {
        const existingPayment = await this.contributionPaymentRepository.findBy({
            studentId,
            managementId,
            activo: true, // Solo pagos activos (no eliminados)
        });

        if (existingPayment) {
            this.logger.warn('[Pagos] Intento de pago duplicado detectado', {
                studentId,
                managementId,
                existingPaymentId: existingPayment.id,
                existingReceiptNumber: existingPayment.numeroRecibo,
            });

            const existingPaymentPlain = existingPayment.toPlainObject ? existingPayment.toPlainObject() : existingPayment;
            const existingReceiptNumber = existingPaymentPlain.receiptNumber || existingPaymentPlain.numeroRecibo || existingPaymentPlain.numero_recibo || existingPayment.id;

            throw new ValidationError(
                'El estudiante ya realizó el pago del aporte académico para la gestión actual. ' +
                `Número de recibo: ${existingReceiptNumber || 'N/A'}`
            );
        }
    }

    /**
     * Valida el método de pago y sus datos requeridos
     * @private
     * @param {number} paymentMethodId - ID del método de pago
     * @param {number|null} paymentAccountId - ID de la cuenta de pago
     * @param {string|null} transactionNumber - Número de transacción (opcional)
     * @param {string|null} codigoComprobante - Código del comprobante (requerido para QR/TRANSFERENCIA/DEPOSITO)
     * @returns {Promise<Object>} Método de pago validado
     * @throws {ValidationError} Si el método no es válido o faltan datos requeridos
     */
    async _validatePaymentMethod(paymentMethodId, paymentAccountId, transactionNumber, codigoComprobante) {
        // Validar que el método de pago exista
        const paymentMethod = await this.paymentMethodRepository.findById(paymentMethodId);
        if (!paymentMethod) {
            throw new NotFoundError(`Método de pago con ID ${paymentMethodId}`);
        }

        // Reglas según método de pago:
        // EFECTIVO (1): cuenta NULL, transacción opcional, código comprobante no aplica
        // QR (2): cuenta opcional, código comprobante REQUERIDO, transacción opcional
        // TRANSFERENCIA (3): cuenta REQUERIDA, código comprobante REQUERIDO, transacción opcional
        // DEPOSITO (4): cuenta REQUERIDA, código comprobante REQUERIDO, transacción opcional

        if (paymentMethodId === 1) { // EFECTIVO
            if (paymentAccountId) {
                throw new ValidationError('El método EFECTIVO no debe tener cuenta de pago asociada');
            }
        } else if (paymentMethodId === 2) { // QR
            // QR no requiere cuenta de pago (está en la imagen del QR)
            // QR requiere código de comprobante
            if (!codigoComprobante) {
                throw new ValidationError(`El método ${paymentMethod.nombre} requiere un código de comprobante`);
            }
        } else if (paymentMethodId === 3) { // TRANSFERENCIA
            if (!paymentAccountId) {
                throw new ValidationError(`El método ${paymentMethod.nombre} requiere una cuenta de pago`);
            }
            if (!codigoComprobante) {
                throw new ValidationError(`El método ${paymentMethod.nombre} requiere un código de comprobante`);
            }
        } else if (paymentMethodId === 4) { // DEPOSITO
            if (!paymentAccountId) {
                throw new ValidationError(`El método ${paymentMethod.nombre} requiere una cuenta de pago`);
            }
            if (!codigoComprobante) {
                throw new ValidationError(`El método ${paymentMethod.nombre} requiere un código de comprobante`);
            }
        }

        return paymentMethod;
    }

    /**
     * Calcula el descuento por beca activa del estudiante
     * @private
     * @param {number} studentId - ID del estudiante
     * @param {number} managementId - ID de la gestión
     * @param {number} totalAmount - Monto total del aporte
     * @returns {Promise<Object>} Objeto con { scholarshipDiscount, studentScholarshipId, scholarshipInfo }
     */
    async _calculateScholarshipDiscount(studentId, managementId, totalAmount) {
        // Buscar beca activa del estudiante en la gestión
        const activeScholarship = await this.studentScholarshipRepository.findBy({
            studentId,
            managementId,
            estado: 'ACTIVA', // Campo correcto según schema
        });

        if (!activeScholarship) {
            this.logger.info('[Pagos] No se encontró beca activa para el estudiante', {
                studentId,
                managementId,
            });
            return {
                scholarshipDiscount: 0.00,
                studentScholarshipId: null,
                scholarshipInfo: null,
            };
        }

        // Obtener el ID de la beca según el mapper, el campo en la entidad es scholarshipId (no becaDescuentoId)
        const scholarshipId = activeScholarship.scholarshipId
            || activeScholarship.becaDescuentoId
            || activeScholarship.beca_descuento_id;

        if (!scholarshipId) {
            this.logger.warn('[Pagos] Beca activa sin ID de tipo de beca', {
                studentId,
                activeScholarshipId: activeScholarship.id,
                activeScholarship: activeScholarship.toPlainObject ? activeScholarship.toPlainObject() : activeScholarship,
            });
            return {
                scholarshipDiscount: 0.00,
                studentScholarshipId: activeScholarship.id,
                scholarshipInfo: null,
            };
        }

        // Obtener el tipo de beca para obtener el porcentaje
        const scholarship = await this.scholarshipRepository.findById(scholarshipId);

        if (!scholarship) {
            this.logger.warn('[Pagos] Tipo de beca no encontrado', {
                studentId,
                scholarshipId,
                activeScholarshipId: activeScholarship.id,
            });
            return {
                scholarshipDiscount: 0.00,
                studentScholarshipId: activeScholarship.id,
                scholarshipInfo: null,
            };
        }

        // Obtener el porcentaje según el mapper, el campo en la entidad es percentage (no porcentaje)
        const percentage = scholarship.percentage
            || scholarship.porcentaje
            || 0;

        if (!percentage || percentage === 0) {
            this.logger.warn('[Pagos] Beca activa sin porcentaje definido o porcentaje es 0', {
                studentId,
                scholarshipId,
                scholarship: scholarship.toPlainObject ? scholarship.toPlainObject() : scholarship,
            });
            return {
                scholarshipDiscount: 0.00,
                studentScholarshipId: activeScholarship.id,
                scholarshipInfo: scholarship,
            };
        }

        // Calcular descuento: monto_total * (porcentaje / 100)
        // El porcentaje viene de la BD como número (ej: 50 para 50%)
        const discountAmount = totalAmount * (Number(percentage) / 100);

        this.logger.info('[Pagos] Descuento por beca calculado', {
            studentId,
            studentScholarshipId: activeScholarship.id,
            scholarshipId,
            scholarshipPercentage: percentage,
            totalAmount,
            discountAmount: parseFloat(discountAmount.toFixed(2)),
        });

        return {
            scholarshipDiscount: parseFloat(discountAmount.toFixed(2)),
            studentScholarshipId: activeScholarship.id,
            scholarshipInfo: scholarship,
        };
    }

    /**
     * Prepara los datos del pago para crear el registro según el nuevo schema (pago_aporte)
     *
     * IMPORTANTE: APLICACIÓN DEL DESCUENTO
     * - monto_total: 400.00 (Aporte académico base, de configuracion_aportes)
     * - descuento_beca: Calculado según beca activa (ej: 50% = 200.00)
     * - monto_pagado: Debe ser igual a (monto_total - descuento_beca)
     *
     * Ejemplo:
     * - monto_total: 400.00
     * - descuento_beca: 200.00 (50%)
     * - monto_pagado: 200.00 (lo que el estudiante paga)
     *
     * @private
     * @param {Object} data - Datos del pago
     * @returns {Object} Datos preparados para el repositorio
     */
    _preparePaymentData(data) {
        const amountToPay = data.amountToPay || (data.totalAmount - data.scholarshipDiscount);

        // La fecha de pago es SIEMPRE requerida (validada en el validador)
        // No se asigna por defecto, debe venir en los datos
        const { paymentDate } = data;
        if (!paymentDate) {
            throw new ValidationError('La fecha de pago es requerida');
        }

        const paymentData = {
            studentId: data.studentId,
            managementId: data.managementId,
            enrollmentId: data.enrollmentId, // NULL inicialmente
            studentScholarshipId: data.studentScholarshipId || null,
            paymentMethodId: data.paymentMethodId,
            paymentAccountId: data.paymentAccountId || null,
            totalAmount: data.totalAmount, // 400.00 (base)
            scholarshipDiscount: data.scholarshipDiscount || 0.00,
            amountPaid: amountToPay,
            paymentDate, // Siempre debe tener un valor (NOT NULL en schema)
            description: data.description || null, // Opcional, puede ser null
        };

        // Solo incluir campos opcionales si tienen valor
        // El número de transacción es independiente del código de comprobante
        if (data.transactionNumber) {
            paymentData.transactionNumber = data.transactionNumber;
        } else {
            paymentData.transactionNumber = null; // Permitir null explícitamente
        }

        // Código de comprobante (requerido para QR/TRANSFERENCIA/DEPOSITO, validado antes)
        // Se pasa desde execute() como comprobanteCode
        if (data.comprobanteCode !== undefined) {
            paymentData.comprobanteCode = data.comprobanteCode;
        } else {
            paymentData.comprobanteCode = null; // Permitir null explícitamente
        }

        // NOTA: El número de recibo se asigna después de crear el registro (usando el ID)

        return paymentData;
    }

    /**
     * Genera el recibo de pago en PDF (recibo por cuota).
     * @private
     * @param {Object} payment - Cuota registrada (pago_cuotas)
     * @param {Object} student - Datos del estudiante
     * @param {Object} management - Gestión académica
     * @param {Object} paymentMethod - Método de pago
     * @param {Object} scholarshipInfo - Información de la beca (si existe)
     * @param {number} totalAmount - Base del aporte (monto_total)
     * @param {number} scholarshipDiscount - Descuento por beca
     * @param {number} montoEstaCuota - Monto de esta cuota (lo que se canceló en este recibo)
     * @param {number} totalPagadoAntes - Monto ya pagado antes de esta cuota
     * @param {number} saldoPendiente - Saldo pendiente después de esta cuota
     * @param {number} montoObligatorio - Total a pagar (base - descuento)
     * @returns {Promise<Object>} Información del PDF generado {filePath, fileName, absolutePath}
     */
    async _generateReciboPDF(payment, student, management, paymentMethod, scholarshipInfo, totalAmount, scholarshipDiscount, montoEstaCuota, totalPagadoAntes = 0, saldoPendiente = 0, montoObligatorio = 0) {
        try {
            const studentPlain = student.toPlainObject ? student.toPlainObject() : student;
            const paymentPlain = payment.toPlainObject ? payment.toPlainObject() : payment;
            const managementPlain = management.toPlainObject ? management.toPlainObject() : management;

            // Número de recibo: ID de pago_cuotas a 6 dígitos (ej. id 7 → "000007"); permite saber a qué recibo corresponde por id
            const numeroReciboParaPdf = (paymentPlain.id != null && paymentPlain.id !== '')
                ? String(paymentPlain.id).padStart(6, '0')
                : (paymentPlain.receiptNumber || paymentPlain.numeroRecibo || paymentPlain.numero_recibo || '000000');

            const reciboData = {
                numeroRecibo: numeroReciboParaPdf,
                fechaPago: paymentPlain.fechaPago || paymentPlain.fecha_pago || paymentPlain.paymentDate || paymentPlain.payment_date,

                nombreCompleto: `${studentPlain.lastName || studentPlain.apellido_paterno || ''} ${studentPlain.motherLastName || studentPlain.apellido_materno || ''} ${studentPlain.firstName || studentPlain.nombres || ''}`.trim().toUpperCase(),
                ci: studentPlain.ci || 'N/A',
                expedicion: studentPlain.expedicion || studentPlain.expedition || '',
                carrera: null,
                cursoParalelo: null,
                anio: null,

                montoTotal: totalAmount || 400.00,
                descuentoBeca: scholarshipDiscount || 0,
                montoObligatorio: montoObligatorio || (totalAmount - scholarshipDiscount),
                totalPagadoAntes: totalPagadoAntes ?? 0,
                montoPagado: montoEstaCuota ?? 0,
                saldoPendiente: saldoPendiente ?? 0,

                concepto: 'Aporte Académico',
                observacion: (paymentPlain.description ?? paymentPlain.descripcion ?? '').toString().trim() || '',
                metodoPago: paymentMethod?.nombre || paymentMethod?.name || 'N/A',
                numeroTransaccion: paymentPlain.numeroTransaccion || paymentPlain.numero_transaccion || paymentPlain.transactionNumber || paymentPlain.transaction_number || null,

                becaInfo: scholarshipInfo ? {
                    nombre: scholarshipInfo.nombre || scholarshipInfo.name,
                    porcentaje: scholarshipInfo.porcentaje || scholarshipInfo.percentage,
                } : null,
            };

            // Generar PDF usando el nuevo generador (retorna Buffer)
            const pdfBuffer = await this.pdfGenerator.generateReciboPago(reciboData);

            // Generar nombre del archivo (mismo criterio que numeroRecibo del recibo)
            const numeroRecibo = numeroReciboParaPdf;
            const year = managementPlain?.anio ?? managementPlain?.year ?? new Date().getFullYear();
            const codigoEstudiante = String(studentPlain?.studentCode ?? studentPlain?.codigo_estudiante ?? studentPlain?.id ?? 'sin-codigo');
            const pdfFileName = `pago_${codigoEstudiante}_${numeroRecibo}.pdf`;

            // Guardar PDF en uploads usando UploadsStorageHelper
            const relativeScope = `recibos/${year}`;
            const result = UploadsStorageHelper.saveToUploads(relativeScope, pdfFileName, pdfBuffer);

            this.logger.info('[Pagos] Recibo PDF generado y guardado exitosamente', {
                paymentId: payment.id,
                filePath: result.filePath,
                absolutePath: result.absolutePath,
                fileName: result.fileName,
                fileSize: pdfBuffer.length,
            });

            return {
                filePath: result.filePath,
                fileName: result.fileName,
                absolutePath: result.absolutePath,
                relativePath: `${relativeScope}/${pdfFileName}`,
            };
        } catch (error) {
            this.logger.error('[Pagos] Error al generar recibo PDF', {
                studentId: payment.studentId || payment.estudianteId,
                paymentId: payment.id,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    /**
     * Guarda el recibo PDF generado en documentos_estudiante
     * Similar a _saveActaDocument en GenerateActaCompromisoUseCase
     * @private
     * @param {number} studentId - ID del estudiante
     * @param {string} fileName - Nombre del archivo PDF
     * @param {string} absolutePath - Ruta absoluta del archivo
     * @param {string} filePath - Ruta relativa desde /uploads/ (ej: /uploads/recibos/2026/...)
     * @returns {Promise<Object>} Documento guardado
     */
    async _saveReciboDocument(studentId, fileName, absolutePath, filePath) {
        try {
            // Extraer ruta relativa sin el prefijo /uploads/ para guardar en BD
            // filePath viene como /uploads/recibos/2026/archivo.pdf
            // Necesitamos guardar solo: recibos/2026/archivo.pdf
            let relativePath = filePath;
            if (relativePath.startsWith('/uploads/')) {
                relativePath = relativePath.substring('/uploads/'.length);
            } else if (relativePath.startsWith('uploads/')) {
                relativePath = relativePath.substring('uploads/'.length);
            }

            // Preparar datos del documento
            const documentData = {
                studentId,
                tipoDocumento: 'PAGO', // El recibo es parte del proceso de pago
                documentacionId: null, // No hay documento específico en catálogo para "Recibo de Pago"
                fileName,
                filePath: relativePath, // Guardar sin prefijo /uploads/
                extension: 'pdf',
                tipoMime: 'application/pdf',
                contieneMultipleDocumentos: false,
                verified: true, // El recibo es generado por el sistema, se considera verificado
                state: 'APROBADO', // El recibo generado por el sistema está aprobado automáticamente
            };

            // Crear el documento
            const document = await this.studentDocumentRepository.create(documentData);

            this.logger.info('[Pagos] Recibo PDF guardado como documento', {
                studentId,
                documentId: document.id,
                fileName,
                filePath: relativePath,
            });

            return document;
        } catch (error) {
            this.logger.error('[Pagos] Error al guardar recibo PDF como documento', {
                error: error.message,
                stack: error.stack,
                studentId,
                fileName,
            });
            throw error;
        }
    }

    /**
     * Guarda el documento de respaldo del pago en documentos_estudiante
     * (Para documentos subidos manualmente por el usuario)
     * @private
     * @param {number} studentId - ID del estudiante
     * @param {number} paymentId - ID del pago registrado
     * @param {Object} fileInfo - Información del archivo subido
     * @param {string} fileInfo.filename - Nombre del archivo guardado
     * @param {string} fileInfo.originalname - Nombre original del archivo
     * @param {string} fileInfo.path - Ruta completa del archivo
     * @param {string} fileInfo.mimetype - Tipo MIME del archivo
     * @param {number} fileInfo.size - Tamaño del archivo en bytes
     * @returns {Promise<Object>} Documento guardado
     */
    async _savePaymentDocument(studentId, paymentId, fileInfo) {
        try {
            // Extraer extensión del archivo
            const ext = path.extname(fileInfo.originalname).toLowerCase();

            // Construir ruta relativa desde uploads/
            // El archivo está en: uploads/documentos/estudiantes/{studentId}/pagos/{filename}
            // La ruta relativa es: documentos/estudiantes/{studentId}/pagos/{filename}
            const relativePath = fileInfo.path.replace(/^.*uploads[\\/]/, 'documentos/').replace(/\\/g, '/');

            // Preparar datos del documento
            const documentData = {
                studentId,
                tipoDocumento: 'PAGO', // Tipo de documento para pagos
                documentacionId: null, // No hay documento específico de catálogo para pagos
                fileName: fileInfo.filename,
                filePath: relativePath,
                extension: ext.replace('.', ''),
                tipoMime: fileInfo.mimetype,
                contieneMultipleDocumentos: false,
                verified: false,
                state: 'PENDIENTE', // Estado inicial: pendiente de verificación
            };

            // Crear el documento
            const document = await this.studentDocumentRepository.create(documentData);

            this.logger.info('[Pagos] Documento de respaldo guardado', {
                studentId,
                paymentId,
                documentId: document.id,
                fileName: fileInfo.filename,
            });

            return document;
        } catch (error) {
            this.logger.error('[Pagos] Error al guardar documento de respaldo', {
                error: error.message,
                stack: error.stack,
                studentId,
                paymentId,
                fileInfo,
            });
            // No lanzar error para no fallar el registro del pago si el documento falla
            // El pago ya está registrado, solo logueamos el error
            return null;
        }
    }

    /**
     * Crea un registro en estudiantes_documentos_entrega para el documento de pago
     * Indica que el documento fue entregado digitalmente
     *
     * @private
     * @param {number} studentId - ID del estudiante
     * @param {number} documentId - ID del documento guardado en documentos_estudiante
     * @param {string} paymentDate - Fecha del pago (YYYY-MM-DD)
     * @param {string} descripcion - Descripción del pago (para observaciones)
     * @returns {Promise<Object>} Registro de entrega de documento creado
     */
    async _savePaymentDocumentDelivery(studentId, documentId, paymentDate, descripcion) {
        try {
            // Preparar datos para estudiantes_documentos_entrega
            // NOTA: documentacionId es NULL porque no hay un documento específico en el catálogo para "comprobante de pago"
            // El documento se guarda en documentos_estudiante con tipoDocumento: 'PAGO'
            const deliveryData = {
                studentId,
                documentacionId: null, // NULL porque no hay documento específico en catálogo para pagos
                entregado: true, // El documento fue entregado digitalmente
                enTramite: false, // No está en trámite, ya fue entregado
                fechaEntrega: paymentDate, // Fecha de entrega = fecha del pago
                observaciones: `Comprobante de pago de aporte académico: ${descripcion || 'Aporte Académico'}.`,
            };

            // Crear el registro de entrega
            const delivery = await this.studentDocumentDeliveryRepository.create(deliveryData);

            this.logger.info('[Pagos] Registro de entrega de documento creado', {
                studentId,
                documentId,
                deliveryId: delivery.id,
            });

            return delivery;
        } catch (error) {
            this.logger.error('[Pagos] Error al crear registro de entrega de documento', {
                error: error.message,
                stack: error.stack,
                studentId,
                documentId,
            });
            // No lanzar error para no fallar el registro del pago
            return null;
        }
    }
}
