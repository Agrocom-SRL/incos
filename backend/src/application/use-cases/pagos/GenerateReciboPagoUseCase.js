import { NotFoundError } from '../../../domain/errors/AppError.js';
import { UploadsStorageHelper } from '../../../infrastructure/external/storage/UploadsStorageHelper.js';
import path from 'path';
import fs from 'fs';
import { serverConfig } from '../../../infrastructure/config/server.config.js';

/**
 * Use Case: GenerateReciboPagoUseCase
 * Módulo: Pagos Académicos
 * Genera o obtiene el recibo de pago de un aporte académico
 * 
 * Responsabilidades:
 * - Verificar si el recibo ya existe en documentos_estudiante
 * - Si existe, retornar la información del archivo existente
 * - Si no existe, generarlo usando la misma lógica que RegisterAporteVoluntarioUseCase
 * - Guardar el recibo generado en documentos_estudiante
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la generación/obtención del recibo de pago
 * - Dependency Inversion: Depende de abstracciones (repositorios)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */
export class GenerateReciboPagoUseCase {
    /**
     * @param {Object} params - Dependencias inyectadas
     * @param {Object} params.contributionPaymentRepository - Repositorio de pagos de aporte
     * @param {Object} params.contributionPaymentInstallmentRepository - Repositorio de cuotas (pago_cuotas)
     * @param {Object} params.studentRepository - Repositorio de estudiantes
     * @param {Object} params.managementRepository - Repositorio de gestiones académicas
     * @param {Object} params.paymentMethodRepository - Repositorio de métodos de pago
     * @param {Object} params.studentScholarshipRepository - Repositorio de becas de estudiantes
     * @param {Object} params.scholarshipRepository - Repositorio de tipos de beca/descuento
     * @param {Object} params.studentDocumentRepository - Repositorio de documentos de estudiantes
     * @param {Object} params.pdfGenerator - Generador de PDFs (PDFGenerator)
     * @param {ILogger} params.logger - Logger para registro de eventos
     */
    constructor({
        contributionPaymentRepository,
        contributionPaymentInstallmentRepository,
        studentRepository,
        managementRepository,
        paymentMethodRepository,
        studentScholarshipRepository,
        scholarshipRepository,
        studentDocumentRepository,
        pdfGenerator,
        logger,
    }) {
        this.contributionPaymentRepository = contributionPaymentRepository;
        this.contributionPaymentInstallmentRepository = contributionPaymentInstallmentRepository;
        this.studentRepository = studentRepository;
        this.managementRepository = managementRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.studentScholarshipRepository = studentScholarshipRepository;
        this.scholarshipRepository = scholarshipRepository;
        this.studentDocumentRepository = studentDocumentRepository;
        this.pdfGenerator = pdfGenerator;
        this.logger = logger;
    }

    /**
     * Ejecuta el caso de uso de generación/obtención del recibo de pago
     * 
     * Flujo:
     * 1. Validar que el pago exista
     * 2. Verificar si el recibo ya existe en documentos_estudiante
     * 3. Si existe, retornar la información del archivo
     * 4. Si no existe, generar el recibo usando la misma lógica que RegisterAporteVoluntarioUseCase
     * 5. Guardar el recibo generado en documentos_estudiante
     * 
     * @param {number|string} paymentId - ID de cuota (numérico), número de recibo (string, ej. "REC-1-1", "000004") o ID de cabecera (numérico)
     * @param {Object} options - Opciones adicionales (por defecto vacío)
     * @returns {Promise<{filePath: string, fileName: string, absolutePath: string}>} Rutas del recibo
     * @throws {NotFoundError} Si no existe cuota ni cabecera con ese id/numero de recibo
     * @throws {Error} Si falla la generación del recibo
     */
    async execute(paymentId, options = {}) {
        this.logger.info('[Pagos] Iniciando generación/obtención de recibo de pago', {
            paymentId,
        });

        try {
            // Aceptar id de cuota (numérico) o número de recibo (string, ej. "REC-1-1", "000004")
            if (this.contributionPaymentInstallmentRepository) {
                const idNum = Number(paymentId);
                if (!Number.isNaN(idNum) && idNum > 0) {
                    const installmentById = await this.contributionPaymentInstallmentRepository.findById(idNum);
                    if (installmentById) {
                        return await this._executeReciboPorCuota(installmentById);
                    }
                }
                if (paymentId != null && String(paymentId).trim() !== '') {
                    const installmentByRecibo = await this.contributionPaymentInstallmentRepository.findBy({ receiptNumber: String(paymentId).trim() });
                    if (installmentByRecibo) {
                        return await this._executeReciboPorCuota(installmentByRecibo);
                    }
                }
            }

            // Si no es cuota, intentar como cabecera (id numérico)
            const idNum = Number(paymentId);
            if (Number.isNaN(idNum) || idNum < 1) {
                throw new NotFoundError(`No se encontró una cuota con número de recibo "${paymentId}" ni cabecera con ID ${paymentId}`);
            }
            const payment = await this.contributionPaymentRepository.findById(idNum);
            if (!payment) {
                throw new NotFoundError(`No se encontró un pago ni cuota con ID ${paymentId}`);
            }

            const paymentPlain = payment.toPlainObject ? payment.toPlainObject() : payment;
            const studentId = paymentPlain.studentId || paymentPlain.student_id;

            // 2. Verificar si el recibo ya existe en documentos_estudiante Y si el archivo físico existe
            const existingRecibo = await this._findExistingRecibo(studentId, idNum);
            let shouldRegenerate = true;
            let existingDocumentId = null;

            if (existingRecibo) {
                // Verificar que el archivo físico realmente exista
                const fileExists = await this._verifyFileExists(existingRecibo);

                if (fileExists) {
                    // El archivo existe, retornarlo sin regenerar
                    this.logger.info('[Pagos] Recibo de pago ya existe y archivo físico encontrado, retornando archivo existente', {
                        paymentId,
                        documentId: existingRecibo.id,
                        fileName: existingRecibo.fileName,
                    });

                    // Construir filePath completo con prefijo /uploads/
                    let filePath = existingRecibo.filePath || '';
                    if (filePath && !filePath.startsWith('/uploads/')) {
                        if (!filePath.startsWith('/')) {
                            filePath = `/uploads/${filePath}`;
                        } else {
                            filePath = `/uploads${filePath}`;
                        }
                    }

                    // Construir absolutePath basado en filePath
                    const uploadDir = serverConfig.uploadsPath || 'uploads';
                    const relativePath = filePath.replace(/^\/uploads\//, '');
                    const absolutePath = path.isAbsolute(uploadDir)
                        ? path.join(uploadDir, relativePath)
                        : path.resolve(serverConfig.backendRoot, uploadDir, relativePath);

                    return {
                        filePath: filePath,
                        fileName: existingRecibo.fileName,
                        absolutePath: absolutePath,
                    };
                } else {
                    // El registro existe en BD pero el archivo físico NO existe, debe regenerarse
                    this.logger.warn('[Pagos] Recibo existe en BD pero archivo físico no encontrado en el sistema de archivos, regenerando PDF', {
                        paymentId,
                        documentId: existingRecibo.id,
                        fileName: existingRecibo.fileName,
                        expectedPath: existingRecibo.filePath,
                    });
                    existingDocumentId = existingRecibo.id;
                    shouldRegenerate = true;
                }
            } else {
                // No existe registro en BD, debe generarse desde cero
                this.logger.info('[Pagos] Recibo no existe en BD, generando nuevo recibo', {
                    paymentId,
                    studentId,
                });
                shouldRegenerate = true;
            }

            // 3. Generar el recibo (ya sea porque no existe o porque el archivo físico fue eliminado)
            if (shouldRegenerate) {
                this.logger.info('[Pagos] Generando recibo de pago', {
                    paymentId,
                    studentId,
                    existingDocumentId: existingDocumentId || 'nuevo',
                });

                // 4. Obtener datos necesarios para generar el recibo
                const [student, management, paymentMethod, studentScholarship, scholarship] = await Promise.all([
                    this.studentRepository.findById(studentId),
                    this.managementRepository.findById(paymentPlain.managementId || paymentPlain.management_id),
                    paymentPlain.paymentMethodId || paymentPlain.payment_method_id
                        ? this.paymentMethodRepository.findById(paymentPlain.paymentMethodId || paymentPlain.payment_method_id)
                        : null,
                    paymentPlain.studentScholarshipId || paymentPlain.student_scholarship_id
                        ? this.studentScholarshipRepository.findById(paymentPlain.studentScholarshipId || paymentPlain.student_scholarship_id)
                        : null,
                    null, // Se obtendrá después si hay studentScholarship
                ]);

                if (!student) {
                    throw new NotFoundError(`No se encontró el estudiante con ID ${studentId}`);
                }

                if (!management) {
                    throw new NotFoundError(`No se encontró la gestión con ID ${paymentPlain.managementId || paymentPlain.management_id}`);
                }

                // Obtener beca si hay studentScholarship
                let scholarshipInfo = null;
                if (studentScholarship) {
                    const scholarshipId = studentScholarship.scholarshipId || studentScholarship.becaDescuentoId || studentScholarship.beca_descuento_id;
                    if (scholarshipId) {
                        scholarshipInfo = await this.scholarshipRepository.findById(scholarshipId);
                    }
                }

                // Observación: la cabecera (pago_aporte) no tiene descripcion; se toma de la última cuota (pago_cuotas.descripcion)
                let observacionCabecera = '';
                if (this.contributionPaymentInstallmentRepository) {
                    const resultCuotas = await this.contributionPaymentInstallmentRepository.findAll(
                        { contributionPaymentId: idNum },
                        1,
                        100
                    );
                    const cuotas = resultCuotas.contributionPaymentInstallments ?? resultCuotas.contributionPaymentInstallment ?? [];
                    if (cuotas.length > 0) {
                        const ultima = cuotas[cuotas.length - 1];
                        const plain = ultima.toPlainObject ? ultima.toPlainObject() : ultima;
                        observacionCabecera = (plain.description ?? plain.descripcion ?? '').toString().trim() || '';
                    }
                }

                // 5. Generar el recibo PDF usando la misma lógica que RegisterAporteVoluntarioUseCase
                const reciboResult = await this._generateReciboPDF(
                    payment,
                    student,
                    management,
                    paymentMethod,
                    scholarshipInfo,
                    paymentPlain.totalAmount || paymentPlain.total_amount || paymentPlain.montoTotal || paymentPlain.monto_total || 400.00,
                    paymentPlain.scholarshipDiscount || paymentPlain.scholarship_discount || paymentPlain.descuentoBeca || paymentPlain.descuento_beca || 0.00,
                    paymentPlain.amountPaid || paymentPlain.amount_paid || paymentPlain.montoPagado || paymentPlain.monto_pagado || (paymentPlain.totalAmount || paymentPlain.total_amount || 400.00),
                    observacionCabecera
                );

                // 6. Guardar o actualizar el recibo en documentos_estudiante
                let savedReciboDocument;
                if (existingDocumentId) {
                    // Actualizar el documento existente con la nueva ruta del archivo regenerado
                    this.logger.info('[Pagos] Actualizando registro de recibo existente con nueva ruta de archivo', {
                        paymentId,
                        documentId: existingDocumentId,
                        newFilePath: reciboResult.filePath,
                    });

                    // Extraer ruta relativa sin el prefijo /uploads/ para guardar en BD
                    let relativePath = reciboResult.filePath;
                    if (relativePath.startsWith('/uploads/')) {
                        relativePath = relativePath.substring('/uploads/'.length);
                    } else if (relativePath.startsWith('uploads/')) {
                        relativePath = relativePath.substring('uploads/'.length);
                    }

                    // Actualizar el documento existente
                    const updateData = {
                        fileName: reciboResult.fileName,
                        filePath: relativePath,
                        absolutePath: reciboResult.absolutePath,
                    };

                    savedReciboDocument = await this.studentDocumentRepository.update(existingDocumentId, updateData);

                    this.logger.info('[Pagos] Registro de recibo actualizado exitosamente', {
                        paymentId,
                        documentId: existingDocumentId,
                        filePath: relativePath,
                    });
                } else {
                    // Crear nuevo documento
                    savedReciboDocument = await this._saveReciboDocument(
                        studentId,
                        reciboResult.fileName,
                        reciboResult.absolutePath,
                        reciboResult.filePath
                    );
                }

                this.logger.info('[Pagos] Recibo de pago generado y guardado exitosamente', {
                    paymentId,
                    documentId: savedReciboDocument?.id,
                    filePath: reciboResult.filePath,
                    fileName: reciboResult.fileName,
                    wasRegenerated: !!existingDocumentId,
                });

                return {
                    filePath: reciboResult.filePath,
                    fileName: reciboResult.fileName,
                    absolutePath: reciboResult.absolutePath,
                };
            }
        } catch (error) {
            this.logger.error('[Pagos] Error al generar/obtener recibo de pago', {
                error: error.message,
                stack: error.stack,
                paymentId,
            });
            throw error;
        }
    }

    /**
     * Genera el recibo de pago para una cuota (pago_cuotas).
     * Usado cuando el id recibido en execute() corresponde a una cuota.
     * @private
     * @param {Object} cuota - Entidad o plain de cuota (pago_cuotas)
     * @returns {Promise<{filePath: string, fileName: string, absolutePath: string}>}
     */
    async _executeReciboPorCuota(cuota) {
        const cuotaPlain = cuota.toPlainObject ? cuota.toPlainObject() : cuota;
        const cabeceraId = cuotaPlain.contributionPaymentId ?? cuotaPlain.pagoAporteId ?? cuotaPlain.pago_aporte_id;
        if (!cabeceraId) {
            throw new NotFoundError(`La cuota con ID ${cuotaPlain.id} no tiene cabecera asociada`);
        }

        const cabecera = await this.contributionPaymentRepository.findById(cabeceraId);
        if (!cabecera) {
            throw new NotFoundError(`No se encontró la cabecera de aporte con ID ${cabeceraId}`);
        }
        const cabeceraPlain = cabecera.toPlainObject ? cabecera.toPlainObject() : cabecera;
        const studentId = cabeceraPlain.studentId ?? cabeceraPlain.estudianteId ?? cabeceraPlain.student_id;
        const montoObligatorio = Number(cabeceraPlain.mandatoryAmount ?? cabeceraPlain.montoObligatorio ?? 0);
        const montoBase = Number(cabeceraPlain.baseAmount ?? cabeceraPlain.montoBase ?? 0);
        const descuentoBeca = Number(cabeceraPlain.scholarshipDiscount ?? cabeceraPlain.descuentoBeca ?? 0);

        const resultCuotas = await this.contributionPaymentInstallmentRepository.findAll(
            { contributionPaymentId: cabeceraId },
            1,
            5000
        );
        const list = resultCuotas.contributionPaymentInstallments ?? resultCuotas.contributionPaymentInstallment ?? [];
        const cuotasOrdenadas = [...list].sort((a, b) => {
            const idA = (a.toPlainObject ? a.toPlainObject() : a).id ?? 0;
            const idB = (b.toPlainObject ? b.toPlainObject() : b).id ?? 0;
            return idA - idB;
        });

        let totalPagadoAntes = 0;
        const cuotaId = cuotaPlain.id;
        for (const c of cuotasOrdenadas) {
            const p = c.toPlainObject ? c.toPlainObject() : c;
            if (p.id === cuotaId) break;
            totalPagadoAntes += Number(p.amount ?? p.monto ?? 0) || 0;
        }
        const montoEstaCuota = Number(cuotaPlain.amount ?? cuotaPlain.monto ?? 0) || 0;
        const totalPagado = totalPagadoAntes + montoEstaCuota;
        const saldoPendiente = Math.max(0, montoObligatorio - totalPagado);

        const [student, management, paymentMethod] = await Promise.all([
            this.studentRepository.findById(studentId),
            this.managementRepository.findById(cabeceraPlain.managementId ?? cabeceraPlain.gestionId ?? cabeceraPlain.management_id),
            (cuotaPlain.paymentMethodId ?? cuotaPlain.metodoPagoId ?? cuotaPlain.metodo_pago_id)
                ? this.paymentMethodRepository.findById(cuotaPlain.paymentMethodId ?? cuotaPlain.metodoPagoId ?? cuotaPlain.metodo_pago_id)
                : null,
        ]);

        if (!student) {
            throw new NotFoundError(`No se encontró el estudiante con ID ${studentId}`);
        }
        if (!management) {
            throw new NotFoundError(`No se encontró la gestión para la cabecera ${cabeceraId}`);
        }

        let scholarshipInfo = null;
        const studentScholarshipId = cabeceraPlain.studentScholarshipId ?? cabeceraPlain.estudianteBecaId ?? cabeceraPlain.estudiante_beca_id;
        if (studentScholarshipId) {
            const studentScholarship = await this.studentScholarshipRepository.findById(studentScholarshipId);
            if (studentScholarship) {
                const plainSs = studentScholarship.toPlainObject ? studentScholarship.toPlainObject() : studentScholarship;
                const scholarshipId = plainSs.scholarshipId ?? plainSs.becaDescuentoId ?? plainSs.beca_descuento_id;
                if (scholarshipId) {
                    scholarshipInfo = await this.scholarshipRepository.findById(scholarshipId);
                }
            }
        }

        const studentPlain = student.toPlainObject ? student.toPlainObject() : student;
        const managementPlain = management.toPlainObject ? management.toPlainObject() : management;
        const numeroRecibo = (cuotaPlain.receiptNumber ?? cuotaPlain.numeroRecibo ?? cuotaPlain.numero_recibo)
            || (cuotaPlain.id != null ? String(cuotaPlain.id).padStart(6, '0') : '000000');

        // Observación: pago_cuotas.descripcion (en entidad se expone como description)
        const observacionCuota = (cuotaPlain.description ?? cuotaPlain.descripcion ?? '').toString().trim() || '';

        const reciboData = {
            numeroRecibo,
            fechaPago: cuotaPlain.paymentDate ?? cuotaPlain.fechaPago ?? cuotaPlain.fecha_pago,
            nombreCompleto: `${studentPlain.lastName ?? studentPlain.apellido_paterno ?? ''} ${studentPlain.motherLastName ?? studentPlain.apellido_materno ?? ''} ${studentPlain.firstName ?? studentPlain.nombres ?? ''}`.trim().toUpperCase(),
            ci: studentPlain.ci ?? 'N/A',
            expedicion: studentPlain.expedicion ?? studentPlain.expedition ?? '',
            carrera: null,
            cursoParalelo: null,
            anio: null,
            montoTotal: montoBase || 400,
            descuentoBeca,
            montoObligatorio,
            totalPagadoAntes,
            montoPagado: montoEstaCuota,
            saldoPendiente,
            concepto: 'Aporte académico',
            metodoPago: paymentMethod?.nombre ?? paymentMethod?.name ?? 'N/A',
            numeroTransaccion: cuotaPlain.transactionNumber ?? cuotaPlain.numeroTransaccion ?? cuotaPlain.numero_transaccion ?? null,
            becaInfo: scholarshipInfo ? { nombre: scholarshipInfo.nombre ?? scholarshipInfo.name, porcentaje: scholarshipInfo.porcentaje ?? scholarshipInfo.percentage } : null,
            observacion: observacionCuota,
        };

        const pdfBuffer = await this.pdfGenerator.generateReciboPago(reciboData);
        const year = managementPlain.anio ?? managementPlain.year ?? new Date().getFullYear();
        const codigoEstudiante = studentPlain.studentCode ?? studentPlain.codigo_estudiante ?? studentPlain.id;
        const fileName = `pago_${codigoEstudiante}_${numeroRecibo}.pdf`;
        const relativeScope = `recibos/${year}`;
        const result = UploadsStorageHelper.saveToUploads(relativeScope, fileName, pdfBuffer);

        this.logger.info('[Pagos] Recibo de cuota generado', { cuotaId: cuotaPlain.id, fileName });
        return {
            filePath: result.filePath,
            fileName: result.fileName,
            absolutePath: result.absolutePath,
        };
    }

    /**
     * Verifica si el archivo físico del recibo existe en el sistema de archivos
     * @private
     * @param {Object} reciboDocument - Documento del recibo desde BD
     * @returns {Promise<boolean>} true si el archivo existe, false si no
     */
    async _verifyFileExists(reciboDocument) {
        try {
            const plain = reciboDocument.toPlainObject ? reciboDocument.toPlainObject() : reciboDocument;
            let filePath = plain.filePath || '';

            // Construir ruta completa
            if (filePath && !filePath.startsWith('/uploads/')) {
                if (!filePath.startsWith('/')) {
                    filePath = `/uploads/${filePath}`;
                } else {
                    filePath = `/uploads${filePath}`;
                }
            }

            // Construir absolutePath
            const uploadDir = serverConfig.uploadsPath || 'uploads';
            const relativePath = filePath.replace(/^\/uploads\//, '');
            const absolutePath = path.isAbsolute(uploadDir)
                ? path.join(uploadDir, relativePath)
                : path.resolve(serverConfig.backendRoot, uploadDir, relativePath);

            // Verificar si el archivo existe físicamente
            const exists = fs.existsSync(absolutePath);

            if (!exists) {
                this.logger.warn('[Pagos] Archivo físico del recibo no encontrado', {
                    documentId: plain.id,
                    filePath: plain.filePath,
                    absolutePath: absolutePath,
                });
            }

            return exists;
        } catch (err) {
            this.logger.warn('[Pagos] Error al verificar existencia del archivo', {
                error: err.message,
                documentId: reciboDocument?.id,
            });
            return false;
        }
    }

    /**
     * Busca si ya existe un recibo de pago para este pago
     * @private
     * @param {number} studentId - ID del estudiante
     * @param {number} paymentId - ID del pago
     * @returns {Promise<Object|null>} Documento del recibo si existe, null si no
     */
    async _findExistingRecibo(studentId, paymentId) {
        if (!studentId || !this.studentDocumentRepository) {
            return null;
        }

        try {
            // Buscar documentos de tipo PAGO para este estudiante
            const result = await this.studentDocumentRepository.findAll({
                studentId,
                tipoDocumento: 'PAGO',
                sort: 'createdAt:DESC',
            }, 1, 10);

            const documents = result?.studentDocuments || [];

            if (documents.length === 0) {
                return null;
            }

            // Buscar el documento que contiene el ID del pago en el nombre del archivo
            const paymentIdStr = String(paymentId).padStart(6, '0');
            const reciboDocument = documents.find((doc) => {
                const plain = doc.toPlainObject ? doc.toPlainObject() : doc;
                const fileName = plain.fileName || '';
                // Buscar si el nombre del archivo contiene el número de recibo (ID del pago)
                return fileName.includes(paymentIdStr) || fileName.includes(`_${paymentId}_`);
            });

            // Si no se encuentra por ID, buscar por número de recibo
            if (!reciboDocument) {
                // Obtener el pago para obtener el número de recibo
                const payment = await this.contributionPaymentRepository.findById(paymentId);
                if (payment) {
                    const paymentPlain = payment.toPlainObject ? payment.toPlainObject() : payment;
                    const receiptNumber = paymentPlain.receiptNumber || paymentPlain.numeroRecibo || paymentPlain.numero_recibo || String(paymentId).padStart(6, '0');

                    const reciboByNumber = documents.find((doc) => {
                        const plain = doc.toPlainObject ? doc.toPlainObject() : doc;
                        const fileName = plain.fileName || '';
                        return fileName.includes(receiptNumber);
                    });

                    if (reciboByNumber) {
                        return reciboByNumber;
                    }
                }
            }

            return reciboDocument || null;
        } catch (err) {
            this.logger.warn('[Pagos] Error al buscar recibo existente', {
                studentId,
                paymentId,
                error: err.message,
            });
            return null;
        }
    }

    /**
     * Genera el recibo de pago en PDF usando la misma lógica que RegisterAporteVoluntarioUseCase
     * @private
     * @param {Object} payment - Registro del pago (cabecera pago_aporte)
     * @param {Object} student - Datos del estudiante
     * @param {Object} management - Gestión académica
     * @param {Object} paymentMethod - Método de pago
     * @param {Object} scholarshipInfo - Información de la beca (si existe)
     * @param {number} totalAmount - Monto total del aporte
     * @param {number} scholarshipDiscount - Descuento por beca
     * @param {number} amountToPay - Monto a pagar (total - descuento)
     * @param {string} [observacionFromCuota] - Observación tomada de la última cuota (pago_cuotas.descripcion); la cabecera no tiene este campo
     * @returns {Promise<Object>} Información del PDF generado {filePath, fileName, absolutePath}
     */
    async _generateReciboPDF(payment, student, management, paymentMethod, scholarshipInfo, totalAmount, scholarshipDiscount, amountToPay, observacionFromCuota = '') {
        try {
            // Convertir a objetos planos
            const studentPlain = student.toPlainObject ? student.toPlainObject() : student;
            const paymentPlain = payment.toPlainObject ? payment.toPlainObject() : payment;
            const managementPlain = management.toPlainObject ? management.toPlainObject() : management;

            // Observación: en BD es pago_cuotas.descripcion; la cabecera (pago_aporte) no tiene descripcion, se pasa desde la última cuota
            const observacion = (observacionFromCuota || paymentPlain.descripcion || paymentPlain.description || '').toString().trim() || '';

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
                concepto: paymentPlain.concepto || paymentPlain.concept || 'Aporte voluntario anual',
                metodoPago: paymentMethod?.nombre || paymentMethod?.name || 'N/A',
                numeroTransaccion: paymentPlain.numeroTransaccion || paymentPlain.numero_transaccion || paymentPlain.transactionNumber || paymentPlain.transaction_number || null,

                // Observación (pago_cuotas.descripcion): plazo, datos adicionales; en UI se llama "Observación"
                observacion,

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
     * Similar a _saveReciboDocument en RegisterAporteVoluntarioUseCase
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
}
