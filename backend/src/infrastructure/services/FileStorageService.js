import fs from 'fs/promises';
import path from 'path';
import { uploadConfig } from '../config/upload.config.js';
import { logger } from '../config/logger.config.js';

/**
 * Servicio de gestión de archivos
 * 
 * Responsabilidades:
 * - Crear/eliminar directorios
 * - Mover/copiar archivos
 * - Generar nombres únicos
 * - Operaciones de sistema de archivos
 */
class FileStorageService {
    constructor() {
        this.uploadDir = uploadConfig.uploadDir;
    }

    /**
     * Crear directorio si no existe
     */
    async ensureDirectory(dirPath) {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
            logger.debug(`Directorio creado: ${dirPath}`);
        }
    }

    /**
     * Generar nombre único
     */
    generateUniqueName(originalName, prefix = '') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        const ext = path.extname(originalName);
        const safeName = path
            .basename(originalName, ext)
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase();

        return prefix
            ? `${prefix}_${safeName}_${timestamp}_${random}${ext}`
            : `${safeName}_${timestamp}_${random}${ext}`;
    }

    /**
     * Obtener ruta para documento de estudiante
     */
    getStudentDocumentPath(estudianteId, fileName) {
        return path.join(
            this.uploadDir,
            'estudiantes',
            estudianteId.toString(),
            'documentos',
            fileName
        );
    }

    /**
     * Obtener ruta para foto de estudiante
     */
    getStudentPhotoPath(estudianteId, fileName) {
        return path.join(
            this.uploadDir,
            'estudiantes',
            estudianteId.toString(),
            'fotos',
            fileName
        );
    }

    /**
     * Mover archivo
     */
    async moveFile(sourcePath, destPath) {
        try {
            const destDir = path.dirname(destPath);
            await this.ensureDirectory(destDir);
            await fs.rename(sourcePath, destPath);
            logger.info(`Archivo movido: ${path.basename(destPath)}`);
            return destPath;
        } catch (error) {
            logger.error('Error al mover archivo:', error);
            throw error;
        }
    }

    /**
     * Copiar archivo
     */
    async copyFile(sourcePath, destPath) {
        try {
            const destDir = path.dirname(destPath);
            await this.ensureDirectory(destDir);
            await fs.copyFile(sourcePath, destPath);
            logger.info(`Archivo copiado: ${path.basename(destPath)}`);
            return destPath;
        } catch (error) {
            logger.error('Error al copiar archivo:', error);
            throw error;
        }
    }

    /**
     * Eliminar archivo
     */
    async deleteFile(filePath) {
        try {
            await fs.unlink(filePath);
            logger.info(`Archivo eliminado: ${path.basename(filePath)}`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                logger.error('Error al eliminar archivo:', error);
                throw error;
            }
        }
    }

    /**
     * Verificar si archivo existe
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
}

export const fileStorageService = new FileStorageService();
export default FileStorageService;