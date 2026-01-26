import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import path from 'path';
import fs from 'fs';
import { UploadsStorageHelper } from '../../../infrastructure/external/storage/UploadsStorageHelper.js';

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
     * @param {Object} params.contributionConfigurationRepository - Repositorio de configuraciones de aportes
     * @param {Object} params.studentDocumentRepository - Repositorio de documentos de estudiantes
     * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
     * @param {Object} params.pdfGenerator - Generador de PDFs (PDFGenerator)
     * @param {ILogger} params.logger - Logger para registro de eventos
     */
    constructor({
        contributionPaymentRepository,
        paymentMethodRepository,
        studentRepository,
        studentScholarshipRepository,
        scholarshipRepository,
        managementRepository,
        contributionConfigurationRepository,
        studentDocumentRepository,
        studentDocumentDeliveryRepository,
        pdfGenerator,
        logger,
    }) {
        this.contributionPaymentRepository = contributionPaymentRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.studentRepository = studentRepository;
        this.studentScholarshipRepository = studentScholarshipRepository;
        this.scholarshipRepository = scholarshipRepository;
        this.managementRepository = managementRepository;
        this.contributionConfigurationRepository = contributionConfigurationRepository;
        this.studentDocumentRepository = studentDocumentRepository;
        this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
        this.pdfGenerator = pdfGenerator;
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

        this.logger.info('[Pagos] Iniciando registro de aporte académico', {
            studentId,
            paymentMethodId,
            concept,
        });

        try {
            // 1. Validar estudiante
            const student = await this._validateStudent(studentId);

            // 2. Obtener gestión vigente (2026, id=2)
            const currentManagement = await this._getCurrentManagement();

            // 3. Obtener configuración de aporte activa para obtener el monto base
            const configuracionAporte = await this._getActiveContributionConfiguration(currentManagement.id);
            const totalAmount = configuracionAporte?.montoBase || configuracionAporte?.baseAmount || 400.00;

            // 4. Validar que no exista un pago previo para esta gestión (NUEVO)
            await this._validateNoDuplicatePayment(studentId, currentManagement.id);

            // 5. Calcular descuento por beca (necesario para determinar si es pago gratuito)
            const { scholarshipDiscount, studentScholarshipId, scholarshipInfo } = await this._calculateScholarshipDiscount(
                studentId,
                currentManagement.id,
                totalAmount
            );

            // 6. Calcular monto a pagar
            const amountToPay = totalAmount - scholarshipDiscount;

            this.logger.info('[Pagos] Monto calculado', {
                studentId,
                totalAmount,
                scholarshipDiscount,
                amountToPay,
                configuracionAporteId: configuracionAporte?.id,
            });

            // 7. Validar método de pago y cuenta (solo si NO es pago gratuito)
            // Si es pago gratuito (amountToPay === 0), usar EFECTIVO (1) por defecto sin validaciones estrictas
            let paymentMethod = null;
            if (amountToPay === 0) {
                // Para pagos gratuitos, usar EFECTIVO por defecto sin validar cuenta ni transacción
                this.logger.info('[Pagos] Pago gratuito detectado, usando método EFECTIVO por defecto', {
                    studentId,
                    amountToPay,
                });
                
                // Obtener método EFECTIVO para incluir en el recibo
                paymentMethod = await this.paymentMethodRepository.findById(1); // EFECTIVO
                if (!paymentMethod) {
                    // Si no existe EFECTIVO, crear uno temporal o usar null
                    this.logger.warn('[Pagos] Método EFECTIVO no encontrado, usando null para pago gratuito');
                }
            } else {
                // Para pagos con monto, validar método de pago normalmente
                paymentMethod = await this._validatePaymentMethod(paymentMethodId, paymentAccountId, transactionNumber);
            }

            // 8. Preparar datos del pago
            // Para pagos gratuitos, usar método EFECTIVO (1) por defecto
            const finalPaymentMethodId = amountToPay === 0 ? 1 : paymentMethodId;
            const finalPaymentAccountId = amountToPay === 0 ? null : paymentAccountId;
            const finalTransactionNumber = amountToPay === 0 ? null : transactionNumber;

            const paymentData = this._preparePaymentData({
                studentId,
                managementId: currentManagement.id,
                enrollmentId: null, // NULL porque el pago es ANTES de inscripción
                studentScholarshipId,
                paymentMethodId: finalPaymentMethodId,
                paymentAccountId: finalPaymentAccountId,
                totalAmount,
                scholarshipDiscount,
                amountToPay,
                paymentDate,
                transactionNumber: finalTransactionNumber,
                concept,
            });

            // 9. Crear registro de pago
            const payment = await this.contributionPaymentRepository.create(paymentData);

            // 10. Usar el ID del pago como número de recibo y actualizar el registro
            // Formato: 000001, 000002, etc. (6 dígitos con ceros a la izquierda)
            const receiptNumber = String(payment.id).padStart(6, '0');
            const updatedPayment = await this.contributionPaymentRepository.update(payment.id, {
                receiptNumber: receiptNumber,
            });
            
            // Usar el pago actualizado (update retorna el objeto actualizado)
            const finalPayment = updatedPayment || payment;
            
            this.logger.info('[Pagos] Número de recibo asignado', {
                paymentId: finalPayment.id,
                receiptNumber,
            });

            // 11. Generar recibo en PDF
            let reciboPDF = null;
            let savedReciboDocument = null;
            if (this.pdfGenerator) {
                try {
                    const reciboResult = await this._generateReciboPDF(
                        finalPayment, // Usar el pago actualizado con número de recibo
                        student, 
                        currentManagement, 
                        paymentMethod, 
                        scholarshipInfo,
                        totalAmount,
                        scholarshipDiscount,
                        amountToPay
                    );
                    reciboPDF = reciboResult.filePath; // Usar filePath (incluye /uploads/)
                    
                    this.logger.info('[Pagos] Recibo PDF generado exitosamente', {
                        paymentId: finalPayment.id,
                        reciboPDFPath: reciboPDF,
                        absolutePath: reciboResult.absolutePath,
                        fileName: reciboResult.fileName,
                    });

                    // 11.1. Guardar recibo PDF en documentos_estudiante
                    if (reciboResult.filePath && reciboResult.fileName) {
                        try {
                            savedReciboDocument = await this._saveReciboDocument(
                                studentId,
                                reciboResult.fileName,
                                reciboResult.absolutePath,
                                reciboResult.filePath // Usar filePath en lugar de relativePath
                            );

                            this.logger.info('[Pagos] Recibo PDF guardado en documentos_estudiante', {
                                studentId,
                                paymentId: finalPayment.id,
                                documentId: savedReciboDocument.id,
                                fileName: reciboResult.fileName,
                            });
                        } catch (saveError) {
                            this.logger.error('[Pagos] Error al guardar recibo PDF en BD', {
                                error: saveError.message,
                                stack: saveError.stack,
                                studentId,
                                paymentId: finalPayment.id,
                            });
                            // No fallar el proceso si falla el guardado en BD
                        }
                    }
                } catch (pdfError) {
                    // Extraer información del error de forma segura
                    const errorInfo = {
                        studentId,
                        paymentId: finalPayment.id,
                        errorMessage: pdfError?.message || 'Error desconocido',
                        errorName: pdfError?.name || 'Error',
                        errorType: pdfError?.constructor?.name || 'Unknown',
                    };

                    // Agregar stack trace si existe
                    if (pdfError?.stack) {
                        errorInfo.stack = pdfError.stack;
                    }

                    // Intentar extraer más información del error si es posible
                    if (pdfError?.code) {
                        errorInfo.errorCode = pdfError.code;
                    }
                    if (pdfError?.errno) {
                        errorInfo.errno = pdfError.errno;
                    }
                    if (pdfError?.syscall) {
                        errorInfo.syscall = pdfError.syscall;
                    }
                    if (pdfError?.path) {
                        errorInfo.path = pdfError.path;
                    }

                    // Si el error tiene propiedades adicionales, intentar incluirlas
                    try {
                        const errorKeys = Object.getOwnPropertyNames(pdfError);
                        if (errorKeys.length > 0) {
                            errorInfo.errorProperties = errorKeys;
                        }
                    } catch (e) {
                        // Ignorar si no se pueden obtener las propiedades
                    }

                    this.logger.error('[Pagos] Error al generar recibo PDF', errorInfo);
                    // No fallar el proceso si el PDF falla
                }
            } else {
                this.logger.warn('[Pagos] PDFGenerator no está disponible, no se generará el recibo PDF');
            }

            // 12. Guardar documento de respaldo si existe
            let savedDocument = null;
            let savedDocumentDelivery = null;
            
            // Debug: Log para verificar si hay archivo
            this.logger.info('[Pagos] Verificando documento de respaldo', {
                hasDocumentFile: !!data.documentFile,
                documentFileInfo: data.documentFile ? {
                    filename: data.documentFile.filename,
                    path: data.documentFile.path,
                } : null,
            });
            
            if (data.documentFile) {
                this.logger.info('[Pagos] Guardando documento de respaldo', {
                    studentId,
                    paymentId: finalPayment.id,
                    fileInfo: data.documentFile,
                });
                
                savedDocument = await this._savePaymentDocument(
                    studentId,
                    finalPayment.id,
                    data.documentFile
                );
                
                // 11.1. Crear registro en estudiantes_documentos_entrega
                if (savedDocument) {
                    this.logger.info('[Pagos] Creando registro de entrega de documento', {
                        studentId,
                        documentId: savedDocument.id,
                        paymentDate,
                        concept,
                    });
                    
                    savedDocumentDelivery = await this._savePaymentDocumentDelivery(
                        studentId,
                        savedDocument.id,
                        paymentDate,
                        concept
                    );
                } else {
                    this.logger.warn('[Pagos] No se pudo guardar el documento de respaldo', {
                        studentId,
                        paymentId: finalPayment.id,
                    });
                }
            } else {
                this.logger.info('[Pagos] No hay documento de respaldo para guardar', {
                    studentId,
                    paymentId: finalPayment.id,
                });
            }

            this.logger.info('[Pagos] Pago registrado exitosamente', {
                paymentId: finalPayment.id,
                receiptNumber: finalPayment.receiptNumber || receiptNumber,
                amountPaid: finalPayment.amountPaid,
                concept: finalPayment.concept,
                hasDocument: !!savedDocument,
                hasReciboPDF: !!reciboPDF,
                hasReciboDocument: !!savedReciboDocument,
            });

            const result = {
                payment: finalPayment.toPlainObject ? finalPayment.toPlainObject() : finalPayment,
            };

            // Incluir recibo PDF generado
            if (reciboPDF) {
                result.reciboPDF = reciboPDF;
            }

            // Incluir documento del recibo generado guardado en BD
            if (savedReciboDocument) {
                result.reciboDocument = savedReciboDocument.toPlainObject 
                    ? savedReciboDocument.toPlainObject() 
                    : savedReciboDocument;
            }

            // Incluir documento de respaldo subido manualmente (si existe)
            if (savedDocument) {
                result.document = savedDocument.toPlainObject ? savedDocument.toPlainObject() : savedDocument;
            }

            if (savedDocumentDelivery) {
                result.documentDelivery = savedDocumentDelivery.toPlainObject ? savedDocumentDelivery.toPlainObject() : savedDocumentDelivery;
            }

            if (reciboPDF) {
                result.reciboPDF = reciboPDF;
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
                `El estudiante ya realizó el pago del aporte académico para la gestión actual. ` +
                `Número de recibo: ${existingReceiptNumber || 'N/A'}`
            );
        }
    }

    /**
     * Valida el método de pago y sus datos requeridos
     * @private
     * @param {number} paymentMethodId - ID del método de pago
     * @param {number|null} paymentAccountId - ID de la cuenta de pago
     * @param {string|null} transactionNumber - Número de transacción
     * @returns {Promise<Object>} Método de pago validado
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

        // NOTA: El número de recibo se asigna después de crear el registro (usando el ID)

        return paymentData;
    }

    /**
     * Genera el recibo de pago en PDF usando el nuevo generador (pdf-lib)
     * @private
     * @param {Object} payment - Registro del pago
     * @param {Object} student - Datos del estudiante
     * @param {Object} management - Gestión académica
     * @param {Object} paymentMethod - Método de pago
     * @param {Object} scholarshipInfo - Información de la beca (si existe)
     * @param {number} totalAmount - Monto total del aporte
     * @param {number} scholarshipDiscount - Descuento por beca
     * @param {number} amountToPay - Monto a pagar (total - descuento)
     * @returns {Promise<Object>} Información del PDF generado {filePath, fileName, absolutePath}
     */
    async _generateReciboPDF(payment, student, management, paymentMethod, scholarshipInfo, totalAmount, scholarshipDiscount, amountToPay) {
        try {
            // Convertir a objetos planos
            const studentPlain = student.toPlainObject ? student.toPlainObject() : student;
            const paymentPlain = payment.toPlainObject ? payment.toPlainObject() : payment;
            const managementPlain = management.toPlainObject ? management.toPlainObject() : management;
            
            // Preparar datos para el PDF
            const reciboData = {
                // Datos del recibo
                numeroRecibo: paymentPlain.receiptNumber || paymentPlain.numeroRecibo || paymentPlain.numero_recibo || String(paymentPlain.id).padStart(6, '0'),
                fechaPago: paymentPlain.fechaPago || paymentPlain.fecha_pago || paymentPlain.paymentDate || paymentPlain.payment_date,

                // Datos del estudiante
                nombreCompleto: `${studentPlain.lastName || studentPlain.apellido_paterno || ''} ${studentPlain.motherLastName || studentPlain.apellido_materno || ''} ${studentPlain.firstName || studentPlain.nombres || ''}`.trim().toUpperCase(),
                ci: studentPlain.ci || 'N/A',
                expedicion: studentPlain.expedicion || studentPlain.expedition || '',
                carrera: null, // No mostrar si no existe
                cursoParalelo: null, // No mostrar si no existe
                anio: null, // No mostrar si no existe

                // Datos del pago
                montoTotal: totalAmount || 400.00,
                descuentoBeca: scholarshipDiscount || 0,
                montoPagado: amountToPay || totalAmount || 400.00,
                concepto: paymentPlain.concepto || paymentPlain.concept || 'Aporte Voluntario Anual',
                metodoPago: paymentMethod?.nombre || paymentMethod?.name || 'N/A',
                numeroTransaccion: paymentPlain.numeroTransaccion || paymentPlain.numero_transaccion || paymentPlain.transactionNumber || paymentPlain.transaction_number || null,
                
                // Información de beca (si existe)
                becaInfo: scholarshipInfo ? {
                    nombre: scholarshipInfo.nombre || scholarshipInfo.name,
                    porcentaje: scholarshipInfo.porcentaje || scholarshipInfo.percentage,
                } : null,
            };

            // Generar PDF usando el nuevo generador (retorna Buffer)
            const pdfBuffer = await this.pdfGenerator.generateReciboPago(reciboData);

            // Generar nombre del archivo
            const numeroRecibo = paymentPlain.receiptNumber || paymentPlain.numeroRecibo || paymentPlain.numero_recibo || String(paymentPlain.id).padStart(6, '0');
            const year = managementPlain.anio || managementPlain.year || new Date().getFullYear();
            const codigoEstudiante = studentPlain.studentCode || studentPlain.codigo_estudiante || studentPlain.id;
            const fileName = `pago_${codigoEstudiante}_${numeroRecibo}.pdf`;

            // Guardar PDF en uploads usando UploadsStorageHelper
            // Usar ruta de recibos según configuración
            const relativeScope = `recibos/${year}`;
            const result = UploadsStorageHelper.saveToUploads(relativeScope, fileName, pdfBuffer);
            
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
                relativePath: relativeScope + '/' + fileName, // Para compatibilidad
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
                fileName: fileName,
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
                fileName: fileName,
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
     * @param {string} concept - Concepto del pago (para observaciones)
     * @returns {Promise<Object>} Registro de entrega de documento creado
     */
    async _savePaymentDocumentDelivery(studentId, documentId, paymentDate, concept) {
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
                observaciones: `Comprobante de pago de aporte académico: ${concept || 'Aporte Académico'}.`,
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