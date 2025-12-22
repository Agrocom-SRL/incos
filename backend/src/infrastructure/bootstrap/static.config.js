import express from 'express';
import { serverConfig } from '../config/server.config.js';
import { logger } from '../config/logger.config.js';

/**
 * Configuración de archivos estáticos
 * 
 * Sirve:
 * - Uploads (documentos de estudiantes, fotos, etc.)
 * - Public (si existe en el futuro)
 */
export function setupStaticFiles(app) {
    // ============================================
    // UPLOADS
    // ============================================
    const uploadsPath = serverConfig.uploadsPath;

    app.use('/uploads', express.static(uploadsPath, {
        maxAge: serverConfig.isProduction ? '1d' : 0, // Cache en producción
        etag: true,
        lastModified: true,
    }));

    logger.info(`Archivos estáticos: ${uploadsPath}`);

    // ============================================
    // PUBLIC (opcional, para el futuro)
    // ============================================
    // const publicPath = 'public';
    // app.use('/public', express.static(publicPath));
}