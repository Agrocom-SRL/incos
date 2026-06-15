import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { multerConfig } from '../../infrastructure/config/multer.config.js';
import { serverConfig } from '../../infrastructure/config/server.config.js';
import { UPLOAD } from '../../infrastructure/config/uploads.config.js';
import { getEnvAsNumber } from '../../infrastructure/config/env.validator.js';

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
            
            // Usar configuración centralizada para construir la ruta
            const relativeScope = UPLOAD.studentPayments(studentId);
            const relativePath = path.join(relativeScope);
            
            // Resolver ruta absoluta usando serverConfig
            const uploadPath = path.isAbsolute(multerConfig.uploadDir)
                ? path.join(multerConfig.uploadDir, relativePath)
                : path.resolve(serverConfig.backendRoot, multerConfig.uploadDir, relativePath);

            // Crear directorio si no existe
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            // Usar función centralizada para generar nombre de archivo
            const filename = UPLOAD.generatePaymentFileName(file.originalname);
            cb(null, filename);
        },
    });

    // Configurar filtro de archivos
    const fileFilter = (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const mimeType = file.mimetype;

        // Validar extensión
        if (!multerConfig.allowedFileTypes.includes(ext)) {
            return cb(
                new Error(
                    `Tipo de archivo no permitido. Tipos permitidos: ${multerConfig.allowedFileTypes.join(', ')}`
                ),
                false
            );
        }

        // Validar MIME type
        if (!multerConfig.allowedMimeTypes.includes(mimeType)) {
            return cb(
                new Error(
                    `Tipo MIME no permitido. Tipos permitidos: ${multerConfig.allowedMimeTypes.join(', ')}`
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
        limits: multerConfig.limits,
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
const CARRERA_IMAGE_EXTENSIONS = UPLOAD.carreraImageExtensions;
const CARRERA_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
  'image/avif',
  'image/heic',
  'image/heif',
  'image/x-icon',
  'image/vnd.microsoft.icon',
];

/**
 * Upload de imagen de carrera → uploads/carreras/{codigo}_{timestamp}.ext
 * Requiere campo multipart `imagen` y texto `codigo` en el body.
 */
export function createCarreraImageUploadMiddleware(fieldName = 'imagen') {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const relativePath = UPLOAD.carreras();
      const uploadPath = path.isAbsolute(multerConfig.uploadDir)
        ? path.join(multerConfig.uploadDir, relativePath)
        : path.resolve(serverConfig.backendRoot, multerConfig.uploadDir, relativePath);

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const codigo = req.body?.codigo ?? req.body?.code ?? 'carrera';
      const filename = UPLOAD.generateCarreraImageFileName(codigo, file.originalname);
      cb(null, filename);
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!CARRERA_IMAGE_EXTENSIONS.includes(ext)) {
      return cb(
        new Error(`Solo imágenes permitidas: ${CARRERA_IMAGE_EXTENSIONS.join(', ')}`),
        false,
      );
    }
    const mime = file.mimetype || '';
    const mimeOk =
      !mime ||
      mime.startsWith('image/') ||
      CARRERA_IMAGE_MIME_TYPES.includes(mime);
    if (!mimeOk) {
      return cb(new Error('Tipo MIME de imagen no permitido'), false);
    }
    cb(null, true);
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: getEnvAsNumber('MAX_CARRERA_IMAGE_SIZE', 5 * 1024 * 1024),
      files: 1,
    },
  });

  return upload.single(fieldName);
}

export const uploadCarreraImagen = (req, res, next) => {
  const middleware = createCarreraImageUploadMiddleware('imagen');
  middleware(req, res, (err) => {
    if (err) {
      return next(err);
    }
    next();
  });
};

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
