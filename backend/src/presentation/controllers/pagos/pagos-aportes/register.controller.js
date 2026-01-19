/**
 * POST /api/v1/pagos-aportes
 * Controller para registrar un pago de aporte académico
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP POST para registrar pagos
 * - Transformar datos del frontend (si es necesario)
 * - Delegar lógica de negocio a RegisterAporteVoluntarioUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * POST /api/v1/pagos-aportes
 * 
 * Body Parameters:
 * - student_id: ID del estudiante
 * - payment_method_id: ID del método de pago (1=EFECTIVO, 2=QR, 3=TRANSFERENCIA)
 * - payment_account_id: ID de la cuenta (NULL para EFECTIVO, requerido para QR/TRANSFERENCIA)
 * - payment_date: Fecha del pago (YYYY-MM-DD)
 * - transaction_number: Número de transacción (requerido para QR/TRANSFERENCIA)
 * - concept: Concepto del pago (ej: "Aporte Académico", "Pago de Matrícula")
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para registrar pagos
 * - Dependency Inversion: Depende de RegisterAporteVoluntarioUseCase
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases)
 */
import { BaseCreateController } from '../../base/BaseCreateController.js';

export class RegisterPagoAporteController extends BaseCreateController {
    /**
     * @param {Object} params - Dependencias inyectadas
     * @param {RegisterAporteVoluntarioUseCase} params.registerPagoAporteUseCase - Caso de uso
     * @param {ILogger} params.logger - Logger
     * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas
     */
    constructor({ registerPagoAporteUseCase, logger, responseFormatter }) {
        super({
            useCase: registerPagoAporteUseCase,
            logger,
            responseFormatter,
            resourceName: 'pago de aporte académico',
            dataFieldName: 'payment',
        });
    }

    /**
     * Prepara los datos del body antes de enviarlos al use case
     * Incluye información del archivo subido si existe
     * 
     * @param {Object} body - Body de la petición HTTP
     * @param {Object} req - Request de Express (para acceder a req.file)
     * @returns {Object} Datos preparados para el use case
     */
    prepareData(body, req) {
        const data = { ...body };

        // Debug: Log del archivo recibido
        this.logger.info('[Pagos] Preparando datos del pago', {
            hasFile: !!req.file,
            fileInfo: req.file ? {
                filename: req.file.filename,
                originalname: req.file.originalname,
                path: req.file.path,
                mimetype: req.file.mimetype,
                size: req.file.size,
            } : null,
            bodyKeys: Object.keys(body),
        });

        // Si hay un archivo subido, agregar información del archivo
        if (req.file) {
            data.documentFile = {
                filename: req.file.filename,
                originalname: req.file.originalname,
                path: req.file.path,
                mimetype: req.file.mimetype,
                size: req.file.size,
            };
        }

        return data;
    }

    /**
     * Maneja la petición HTTP
     * Sobrescribe el método handle para pasar req al prepareData
     * 
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     * @param {Function} next - Next middleware
     */
    async handle(req, res, next) {
        try {
            const body = req.body;
            const preparedData = this.prepareData(body, req);

            const result = await this.useCase.execute(preparedData);

            // Extraer datos y ID para la respuesta
            const responseData = result[this.dataFieldName] || result.payment || result;
            const resourceId = responseData?.id || 'nuevo';

            // Usar el método created() del responseFormatter (igual que BaseCreateController)
            return this.responseFormatter.created(
                res,
                responseData,
                this.resourceName,
                resourceId,
                req
            );
        } catch (error) {
            return next(error);
        }
    }
}