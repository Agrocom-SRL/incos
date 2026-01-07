/**
 * Registrador de servicios base (infraestructura)
 * 
 * Servicios registrados:
 * - logger: Sistema de logging (Winston) - Implementa ILogger
 * - errorFormatter: Formateo de errores para respuestas HTTP
 * - responseFormatter: Formateo de respuestas exitosas
 * - validateRequest: Middleware de validación de requests
 * 
 * Servicios disponibles pero no registrados hasta que se necesiten:
 * - fileUploadService: Servicio de subida de archivos (Multer)
 * - fileStorageService: Gestión de archivos
 * - emailService: Envío de emails
 * - pdfService: Generación de PDFs
 * 
 * Todos los servicios se registran como singleton ya que:
 * - No mantienen estado mutable por request
 * - Son compartidos entre módulos
 * - Mejora el rendimiento (una sola instancia)
 * 
 * Nota: El logger implementa ILogger del dominio (backend/src/domain/interfaces/services/ILogger.js)
 */

import { SERVICIOS_TOKENS } from '../tokens/index.js';
import { registerService } from '../utils/container.helpers.js';
import { logger } from '../../services/WinstonLoggerFactory.js';
import { errorFormatter } from '../../services/ErrorFormatter.js';
import { responseFormatter } from '../../services/ResponseFormatter.js';
import { createValidateRequest } from '../../../presentation/middleware/validation.middleware.js';

export function registerServicesModule(container) {
    // ============================================
    // LOGGING (DI: instancia singleton)
    // ============================================
    registerService(container, SERVICIOS_TOKENS.logger, logger);

    // ============================================
    // ERROR FORMATTING
    // ============================================
    registerService(container, SERVICIOS_TOKENS.errorFormatter, errorFormatter);

    // ============================================
    // SUCCESS RESPONSE FORMATTING
    // ============================================
    registerService(container, SERVICIOS_TOKENS.responseFormatter, responseFormatter);

    // ============================================
    // VALIDATION MIDDLEWARE
    // ============================================
    registerService(
        container,
        SERVICIOS_TOKENS.validateRequest,
        (c) => createValidateRequest(c.resolve(SERVICIOS_TOKENS.logger))
    );

    // ============================================
    // FILE STORAGE & FILE UPLOAD
    // ============================================
    // Estos servicios se registrarán cuando se implementen y se necesiten
    // Por ahora no están en uso, así que no se registran aquí

    return container;
}


