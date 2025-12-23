/**
 * Registrador de servicios base (infraestructura)
 * 
 * Servicios registrados:
 * - logger: Sistema de logging (Winston)
 * - fileUploadService: Servicio de subida de archivos (Multer)
 * - fileStorageService: Gestión de archivos (futuro)
 * - emailService: Envío de emails (futuro)
 * - pdfService: Generación de PDFs (futuro)
 * 
 * Todos los servicios se registran como singleton ya que:
 * - No mantienen estado mutable por request
 * - Son compartidos entre módulos
 * - Mejora el rendimiento (una sola instancia)
 */

import { TOKENS } from '../tokens.js';
import { logger } from '../../../infrastructure/config/logger.config.js'; // ✅ Ruta actualizada
import { fileUploadService } from '../../services/FileUploadService.js';

export function registerServicesModule(container) {
    // ============================================
    // LOGGING
    // ============================================
    if (!container.has(TOKENS.logger)) {
        container.register(
            TOKENS.logger,
            () => logger,
            { singleton: true }
        );
    }

    // ============================================
    // FILE UPLOAD
    // ============================================
    if (!container.has(TOKENS.fileUploadService)) {
        container.register(
            TOKENS.fileUploadService,
            () => fileUploadService,
            { singleton: true }
        );
    }

    // ============================================
    // FILE STORAGE (Futuro)
    // ============================================
    // if (!container.has(TOKENS.fileStorageService)) {
    //   container.register(
    //     TOKENS.fileStorageService,
    //     () => fileStorageService,
    //     { singleton: true }
    //   );
    // }

    return container;
}