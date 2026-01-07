import { getEnv, getEnvAsNumber } from './env.validator.js';

/**
 * Configuración de uploads (Multer)
 */
export const uploadConfig = {
    // Directorio de uploads
    uploadDir: getEnv('UPLOAD_DIR', 'uploads'),

    // Tamaño máximo de archivo (en bytes)
    // 50MB por defecto (52428800 bytes)
    maxFileSize: getEnvAsNumber('MAX_FILE_SIZE', 52428800),

    // Tipos de archivo permitidos
    allowedFileTypes: getEnv(
        'ALLOWED_FILE_TYPES',
        '.jpg,.jpeg,.png,.webp,.pdf,.doc,.docx'
    )
        .split(',')
        .map((ext) => ext.trim()),

    // MIME types permitidos (para validación adicional)
    allowedMimeTypes: [
        // Imágenes
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        // Documentos
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    ],


    // Límites
    limits: {
        fileSize: getEnvAsNumber('MAX_FILE_SIZE', 52428800), // 50MB
        files: 10, // Máximo 10 archivos por request
        fieldNameSize: 100, // Máximo tamaño del nombre del campo
        fieldSize: 1024 * 1024, // Máximo 1MB para campos de texto
    },
};