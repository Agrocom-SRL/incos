import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { serverConfig } from '../config/server.config.js';
import { logger } from '../config/logger.config.js';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    // Convertir ruta relativa a absoluta desde el directorio del backend
    const uploadsPath = path.isAbsolute(serverConfig.uploadsPath)
        ? serverConfig.uploadsPath
        : path.resolve(__dirname, '../../..', serverConfig.uploadsPath);

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