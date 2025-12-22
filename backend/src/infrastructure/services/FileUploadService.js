import multer from 'multer';
import path from 'path';
import { uploadConfig } from '../config/upload.config.js';
import { fileStorageService } from './FileStorageService.js';
import { logger } from '../config/logger.config.js';

/**
 * Servicio de subida de archivos con Multer
 * 
 * Responsabilidades:
 * - Configurar Multer
 * - Validar archivos
 * - Proveer middlewares
 */
class FileUploadService {
    /**
     * Validar tipo de archivo
     */
    validateFile(file) {
        const ext = path.extname(file.originalname).toLowerCase();
        const mimetype = file.mimetype;

        if (!uploadConfig.allowedFileTypes.includes(ext)) {
            return {
                valid: false,
                error: `Extensión no permitida: ${ext}`,
            };
        }

        if (!uploadConfig.allowedMimeTypes.includes(mimetype)) {
            return {
                valid: false,
                error: `Tipo no permitido: ${mimetype}`,
            };
        }

        return { valid: true };
    }

    /**
     * Storage para documentos de estudiante
     */
    getStudentDocumentStorage() {
        return multer.diskStorage({
            destination: async (req, file, cb) => {
                try {
                    const estudianteId = req.params?.id || 'temp';
                    const destDir = path.join(
                        uploadConfig.uploadDir,
                        'estudiantes',
                        estudianteId.toString(),
                        'documentos'
                    );

                    await fileStorageService.ensureDirectory(destDir);
                    cb(null, destDir);
                } catch (error) {
                    cb(error);
                }
            },

            filename: (req, file, cb) => {
                const documentacionId = req.body?.documentacionId || 'doc';
                const uniqueName = fileStorageService.generateUniqueName(
                    file.originalname,
                    `doc_${documentacionId}`
                );
                cb(null, uniqueName);
            },
        });
    }

    /**
     * Storage para fotos de estudiante
     */
    getStudentPhotoStorage() {
        return multer.diskStorage({
            destination: async (req, file, cb) => {
                try {
                    const estudianteId = req.params?.id || 'temp';
                    const destDir = path.join(
                        uploadConfig.uploadDir,
                        'estudiantes',
                        estudianteId.toString(),
                        'fotos'
                    );

                    await fileStorageService.ensureDirectory(destDir);
                    cb(null, destDir);
                } catch (error) {
                    cb(error);
                }
            },

            filename: (req, file, cb) => {
                const uniqueName = fileStorageService.generateUniqueName(
                    file.originalname,
                    'foto'
                );
                cb(null, uniqueName);
            },
        });
    }

    /**
     * Filtro de archivos
     */
    getFileFilter() {
        return (req, file, cb) => {
            const validation = this.validateFile(file);

            if (!validation.valid) {
                logger.warn(`Archivo rechazado: ${validation.error}`);
                return cb(new Error(validation.error), false);
            }

            cb(null, true);
        };
    }

    /**
     * Middleware: Subir documento de estudiante
     */
    uploadStudentDocument() {
        return multer({
            storage: this.getStudentDocumentStorage(),
            fileFilter: this.getFileFilter(),
            limits: uploadConfig.limits,
        }).single('documento');
    }

    /**
     * Middleware: Subir múltiples documentos
     */
    uploadStudentDocuments(maxCount = 10) {
        return multer({
            storage: this.getStudentDocumentStorage(),
            fileFilter: this.getFileFilter(),
            limits: uploadConfig.limits,
        }).array('documentos', maxCount);
    }

    /**
     * Middleware: Subir foto de estudiante
     */
    uploadStudentPhoto() {
        return multer({
            storage: this.getStudentPhotoStorage(),
            fileFilter: (req, file, cb) => {
                const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                if (!imageTypes.includes(file.mimetype)) {
                    return cb(new Error('Solo imágenes (JPG, PNG, WEBP)'), false);
                }
                cb(null, true);
            },
            limits: {
                fileSize: 2 * 1024 * 1024, // 2MB
            },
        }).single('foto');
    }
}

export const fileUploadService = new FileUploadService();
export default FileUploadService;