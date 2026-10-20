import express from 'express';
import path from 'path';
import { serverConfig } from '../config/server.config.js';

/**
 * Configuración de archivos estáticos
 *
 * Sirve:
 * - Uploads (documentos de estudiantes, fotos, etc.)
 * - Public (si existe en el futuro)
 *
 * @param {Express} app - Aplicación Express
 * @param {ILogger} logger - Logger inyectado (DI)
 */
export function setupStaticFiles(app, logger) {
    // ============================================
    // UPLOADS
    // ============================================
    // Convertir ruta relativa a absoluta desde el directorio del backend
    const uploadsPath = path.isAbsolute(serverConfig.uploadsPath)
        ? serverConfig.uploadsPath
        : path.resolve(serverConfig.backendRoot, serverConfig.uploadsPath);

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
