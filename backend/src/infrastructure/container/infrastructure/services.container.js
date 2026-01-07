/**
 * Registrador de servicios base (infraestructura)
 * 
 * Servicios registrados:
 * - logger: Sistema de logging (Winston) - Implementa ILogger
 * - errorFormatter: Formateo de errores para respuestas HTTP
 * - fileUploadService: Servicio de subida de archivos (Multer)
 * - fileStorageService: Gestión de archivos (futuro)
 * - emailService: Envío de emails (futuro)
 * - pdfService: Generación de PDFs (futuro)
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
import { logger } from '../../services/WinstonLoggerAdapter.js';
import { errorFormatter } from '../../services/ErrorFormatter.js';
import { responseFormatter } from '../../services/ResponseFormatter.js';
import { createValidateRequest } from '../../../presentation/middleware/validation.middleware.js';
import { fileUploadService } from '../../services/FileUploadService.js';

export function registerServicesModule(container) {
    // ============================================
    // LOGGING
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
    // FILE UPLOAD
    // ============================================
    registerService(container, SERVICIOS_TOKENS.fileUploadService, fileUploadService);

    // ============================================
    // FILE STORAGE (Futuro)
    // ============================================
    // registerService(container, SERVICIOS_TOKENS.fileStorageService, fileStorageService);

    return container;
}


