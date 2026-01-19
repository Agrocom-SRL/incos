import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { uploadConfig } from '../../infrastructure/config/upload.config.js';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Middleware de upload para documentos de pago
 * 
 * Configura multer para subir archivos de documentos de respaldo de pagos
 * Los archivos se guardan en: uploads/documentos/estudiantes/{studentId}/pagos/
 * 
 * @param {string} fieldName - Nombre del campo del formulario que contiene el archivo (default: 'documentoRespaldo')
 * @returns {Function} Middleware de multer
 */
export function createUploadMiddleware(fieldName = 'documentoRespaldo') {
    // Configurar almacenamiento
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            // Obtener student_id del body o params
            const studentId = req.body.student_id || req.params.studentId || 'temp';
            
            // Crear ruta: backend/uploads/documentos/estudiantes/{studentId}/pagos/
            // __dirname es: backend/src/presentation/middleware/
            // Necesitamos subir 3 niveles para llegar a backend/
            const uploadPath = path.resolve(
                __dirname,
                '../../../',  // Subir 3 niveles: middleware -> presentation -> src -> backend
                uploadConfig.uploadDir,
                'documentos',
                'estudiantes',
                String(studentId),
                'pagos'
            );

            // Crear directorio si no existe
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            // Generar nombre único: PAGO_{timestamp}_{nombreOriginal}
            const timestamp = Date.now();
            const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
            const ext = path.extname(originalName);
            const nameWithoutExt = path.basename(originalName, ext);
            const filename = `PAGO_${timestamp}_${nameWithoutExt}${ext}`;
            cb(null, filename);
        },
    });

    // Configurar filtro de archivos
    const fileFilter = (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const mimeType = file.mimetype;

        // Validar extensión
        if (!uploadConfig.allowedFileTypes.includes(ext)) {
            return cb(
                new Error(
                    `Tipo de archivo no permitido. Tipos permitidos: ${uploadConfig.allowedFileTypes.join(', ')}`
                ),
                false
            );
        }

        // Validar MIME type
        if (!uploadConfig.allowedMimeTypes.includes(mimeType)) {
            return cb(
                new Error(
                    `Tipo MIME no permitido. Tipos permitidos: ${uploadConfig.allowedMimeTypes.join(', ')}`
                ),
                false
            );
        }

        cb(null, true);
    };

    // Crear instancia de multer
    const upload = multer({
        storage,
        fileFilter,
        limits: uploadConfig.limits,
    });

    // Retornar middleware para un solo archivo
    return upload.single(fieldName);
}

/**
 * Middleware de upload para documentos de pago (factory)
 * Usa el campo 'documentoRespaldo' por defecto
 */
const baseUploadMiddleware = createUploadMiddleware('documentoRespaldo');

/**
 * Wrapper del middleware de upload con logging
 */
export const uploadPaymentDocument = (req, res, next) => {
    // Log antes de procesar el upload
    console.log('[Upload] Iniciando procesamiento de archivo', {
        fieldName: 'documentoRespaldo',
        hasBody: !!req.body,
        bodyKeys: req.body ? Object.keys(req.body) : [],
        contentType: req.headers['content-type'],
    });

    baseUploadMiddleware(req, res, (err) => {
        if (err) {
            console.error('[Upload] Error en multer:', err.message, err.code);
            return next(err);
        }

        // Log después de procesar el upload
        console.log('[Upload] Archivo procesado', {
            hasFile: !!req.file,
            fileInfo: req.file ? {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path,
                mimetype: req.file.mimetype,
                size: req.file.size,
            } : null,
        });

        next();
    });
};
