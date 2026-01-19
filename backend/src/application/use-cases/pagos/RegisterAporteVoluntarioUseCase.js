import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import path from 'path';

/**
 * Use Case: RegisterAporteVoluntarioUseCase
 * Módulo: Pagos Académicos
 * Registra el pago del aporte académico de un estudiante
 * 
 * IMPORTANTE: El pago se realiza ANTES de la inscripción según el nuevo schema.
 * El recibo y comprobante son documentos requeridos para inscribirse.
 * 
 * REGLA DE NEGOCIO: Un estudiante solo puede pagar UNA VEZ por gestión académica.
 * 
 * APLICACIÓN DEL DESCUENTO POR BECA:
 * 
 * - monto_total: 400.00 (Aporte académico base, de configuracion_aportes)
 * - descuento_beca: Calculado automáticamente según beca activa del estudiante
 *   Ejemplo: Si tiene beca 50% → descuento_beca = 200.00
 * - monto_pagado: Debe ser igual a (monto_total - descuento_beca)
 * 
 * Ejemplo con beca 50%:
 *   - monto_total: 400.00
 *   - descuento_beca: 200.00 (50%)
 *   - monto_pagado: 200.00 (lo que el estudiante paga)
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja el registro de pagos del aporte académico
 * - Dependency Inversion: Depende de abstracciones (repositorios)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */
export class RegisterAporteVoluntarioUseCase {
    /**
     * @param {Object} params - Dependencias inyectadas
     * @param {Object} params.contributionPaymentRepository - Repositorio de pagos de aporte
     * @param {Object} params.paymentMethodRepository - Repositorio de métodos de pago
     * @param {Object} params.studentRepository - Repositorio de estudiantes
     * @param {Object} params.studentScholarshipRepository - Repositorio de becas de estudiantes
     * @param {Object} params.scholarshipRepository - Repositorio de tipos de beca/descuento
     * @param {Object} params.managementRepository - Repositorio de gestiones académicas
     * @param {Object} params.studentDocumentRepository - Repositorio de documentos de estudiantes
     * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
     * @param {ILogger} params.logger - Logger para registro de eventos
     */
    constructor({
        contributionPaymentRepository,
        paymentMethodRepository,
        studentRepository,
        studentScholarshipRepository,
        scholarshipRepository,
        managementRepository,
        studentDocumentRepository,
        studentDocumentDeliveryRepository,
        logger,
    }) {
        this.contributionPaymentRepository = contributionPaymentRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.studentRepository = studentRepository;
        this.studentScholarshipRepository = studentScholarshipRepository;
        this.scholarshipRepository = scholarshipRepository;
        this.managementRepository = managementRepository;
        this.studentDocumentRepository = studentDocumentRepository;
        this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
        this.logger = logger;
    }

    /**
     * Ejecuta el caso de uso de registro de aporte académico
     * 
     * Flujo:
     * 1. Validar estudiante
     * 2. Obtener gestión vigente
     * 3. Validar que no exista un pago previo para esta gestión (NUEVO)
     * 4. Validar método de pago y cuenta
     * 5. Calcular descuento por beca (si existe)
     * 6. Calcular monto a pagar
     * 7. Crear registro de pago
     * 
     * @param {Object} data - Datos del pago (snake_case desde frontend)
     * @param {number} data.student_id - ID del estudiante (requerido)
     * @param {number} data.payment_method_id - ID del método de pago (requerido)
     * @param {number|null} data.payment_account_id - ID de la cuenta (NULL para EFECTIVO)
     * @param {string} data.payment_date - Fecha del pago en formato YYYY-MM-DD (requerido)
     * @param {string} [data.transaction_number] - Número de transacción (requerido para QR/TRANSFERENCIA)
     * @param {string} data.concept - Concepto del pago (requerido)
     * @returns {Promise<Object>} Pago creado con todos sus datos
     */
    async execute(data) {
        const studentId = data.student_id || data.studentId;
        const paymentMethodId = data.payment_method_id || data.paymentMethodId;
        const paymentAccountId = data.payment_account_id || data.paymentAccountId || null;
        const paymentDate = data.payment_date || data.paymentDate;
        const transactionNumber = data.transaction_number || data.transactionNumber || null;
        const concept = data.concept;

        // Monto total siempre es 400.00 (de configuracion_aportes)
        const totalAmount = 400.00;

        this.logger.info('[Pagos] Iniciando registro de aporte académico', {
            studentId,
            paymentMethodId,
            totalAmount,
            concept,
        });

        try {
            // 1. Validar estudiante
            const student = await this._validateStudent(studentId);

            // 2. Obtener gestión vigente (2026, id=2)
            const currentManagement = await this._getCurrentManagement();

            // 3. Validar que no exista un pago previo para esta gestión (NUEVO)
            await this._validateNoDuplicatePayment(studentId, currentManagement.id);

            // 4. Validar método de pago y cuenta
            await this._validatePaymentMethod(paymentMethodId, paymentAccountId, transactionNumber);

            // 5. Calcular descuento por beca
            const { scholarshipDiscount, studentScholarshipId } = await this._calculateScholarshipDiscount(
                studentId,
                currentManagement.id,
                totalAmount
            );

            // 6. Calcular monto a pagar
            const amountToPay = totalAmount - scholarshipDiscount;

            // 7. Preparar datos del pago
            const paymentData = this._preparePaymentData({
                studentId,
                managementId: currentManagement.id,
                enrollmentId: null, // NULL porque el pago es ANTES de inscripción
                studentScholarshipId,
                paymentMethodId,
                paymentAccountId,
                totalAmount,
                scholarshipDiscount,
                amountToPay,
                paymentDate,
                transactionNumber,
                concept,
            });

            // 8. Crear registro de pago
            const payment = await this.contributionPaymentRepository.create(paymentData);

            // 9. Guardar documento de respaldo si existe
            let savedDocument = null;
            let savedDocumentDelivery = null;
            if (data.documentFile) {
                savedDocument = await this._savePaymentDocument(
                    studentId,
                    payment.id,
                    data.documentFile
                );
                
                // 10. Crear registro en estudiantes_documentos_entrega
                if (savedDocument) {
                    savedDocumentDelivery = await this._savePaymentDocumentDelivery(
                        studentId,
                        savedDocument.id,
                        paymentDate
                    );
                }
            }

            this.logger.info('[Pagos] Pago registrado exitosamente', {
                paymentId: payment.id,
                receiptNumber: payment.receiptNumber,
                amountPaid: payment.amountPaid,
                concept: payment.concept,
                hasDocument: !!savedDocument,
            });

            const result = {
                payment: payment.toPlainObject ? payment.toPlainObject() : payment,
            };

            if (savedDocument) {
                result.document = savedDocument.toPlainObject ? savedDocument.toPlainObject() : savedDocument;
            }

            if (savedDocumentDelivery) {
                result.documentDelivery = savedDocumentDelivery.toPlainObject ? savedDocumentDelivery.toPlainObject() : savedDocumentDelivery;
            }

            return result;
        } catch (error) {
            this.logger.error('[Pagos] Error al registrar pago', {
                error: error.message,
                stack: error.stack,
                data,
            });
            throw error;
        }
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

            throw new ValidationError(
                `El estudiante ya realizó el pago del aporte académico para la gestión actual. ` +
                `Número de recibo: ${existingPayment.numeroRecibo || 'N/A'}`
            );
        }
    }

    /**
     * Valida el método de pago y sus datos requeridos
     * @private
     * @param {number} paymentMethodId - ID del método de pago
     * @param {number|null} paymentAccountId - ID de la cuenta de pago
     * @param {string|null} transactionNumber - Número de transacción
     * @throws {ValidationError} Si el método no es válido o faltan datos requeridos
     */
    async _validatePaymentMethod(paymentMethodId, paymentAccountId, transactionNumber) {
        // Validar que el método de pago exista
        const paymentMethod = await this.paymentMethodRepository.findById(paymentMethodId);
        if (!paymentMethod) {
            throw new NotFoundError(`Método de pago con ID ${paymentMethodId}`);
        }

        // Reglas según método de pago:
        // EFECTIVO (1): cuenta NULL, transacción opcional
        // QR (2): cuenta opcional (la cuenta está en la imagen del QR), transacción requerida
        // TRANSFERENCIA (3): cuenta requerida, transacción requerida

        if (paymentMethodId === 1) { // EFECTIVO
            if (paymentAccountId) {
                throw new ValidationError('El método EFECTIVO no debe tener cuenta de pago asociada');
            }
        } else if (paymentMethodId === 2) { // QR
            // QR no requiere cuenta de pago (está en la imagen del QR)
            if (!transactionNumber) {
                throw new ValidationError(`El método ${paymentMethod.nombre} requiere un número de transacción`);
            }
        } else if (paymentMethodId === 3) { // TRANSFERENCIA
            if (!paymentAccountId) {
                throw new ValidationError(`El método ${paymentMethod.nombre} requiere una cuenta de pago`);
            }
            if (!transactionNumber) {
                throw new ValidationError(`El método ${paymentMethod.nombre} requiere un número de transacción`);
            }
        }
    }

    /**
     * Calcula el descuento por beca activa del estudiante
     * @private
     * @param {number} studentId - ID del estudiante
     * @param {number} managementId - ID de la gestión
     * @param {number} totalAmount - Monto total del aporte
     * @returns {Promise<Object>} Objeto con { scholarshipDiscount, studentScholarshipId }
     */
    async _calculateScholarshipDiscount(studentId, managementId, totalAmount) {
        // Buscar beca activa del estudiante en la gestión
        const activeScholarship = await this.studentScholarshipRepository.findBy({
            studentId,
            managementId,
            estado: 'ACTIVA', // Campo correcto según schema
        });

        if (!activeScholarship) {
            return {
                scholarshipDiscount: 0.00,
                studentScholarshipId: null,
            };
        }

        // Obtener el tipo de beca para obtener el porcentaje
        const scholarship = await this.scholarshipRepository.findById(
            activeScholarship.becaDescuentoId // Campo correcto según schema
        );

        if (!scholarship || !scholarship.porcentaje) {
            this.logger.warn('[Pagos] Beca activa sin porcentaje definido', {
                studentId,
                scholarshipId: activeScholarship.becaDescuentoId,
            });
            return {
                scholarshipDiscount: 0.00,
                studentScholarshipId: activeScholarship.id,
            };
        }

        // Calcular descuento: monto_total * (porcentaje / 100)
        const discountAmount = totalAmount * (scholarship.porcentaje / 100);

        this.logger.info('[Pagos] Descuento por beca calculado', {
            studentId,
            studentScholarshipId: activeScholarship.id,
            scholarshipPercentage: scholarship.porcentaje,
            totalAmount,
            discountAmount,
        });

        return {
            scholarshipDiscount: parseFloat(discountAmount.toFixed(2)),
            studentScholarshipId: activeScholarship.id,
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
            paymentDate: data.paymentDate,
            concept: data.concept,
        };

        // Solo incluir campos opcionales si tienen valor
        if (data.transactionNumber) {
            paymentData.transactionNumber = data.transactionNumber;
        }

        return paymentData;
    }

    /**
     * Guarda el documento de respaldo del pago en documentos_estudiante
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
     * @returns {Promise<Object>} Registro de entrega de documento creado
     */
    async _savePaymentDocumentDelivery(studentId, documentId, paymentDate) {
        try {
            // Preparar datos para estudiantes_documentos_entrega
            // NOTA: documentacionId es NULL porque no hay un documento específico en el catálogo para "comprobante de pago"
            // El documento se guarda en documentos_estudiante con tipoDocumento: 'PAGO'
            const deliveryData = {
                studentId,
                documentacionId: null, // NULL porque no hay documento específico en catálogo para pagos
                entregado: true, // El documento fue entregado digitalmente
                enTramite: false, // No está en trámite, ya fue entregado
                esOriginal: false, // Es una copia digital, no el original físico
                fechaEntrega: paymentDate, // Fecha de entrega = fecha del pago
                fechaVencimientoTramite: null, // No aplica porque no está en trámite
                observaciones: `Comprobante de pago de aporte académico. Documento digital subido al registrar el pago.`,
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