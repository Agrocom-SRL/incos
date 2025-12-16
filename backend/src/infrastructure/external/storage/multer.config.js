/**
 * Configuración de Multer para subida de archivos
 * 
 * NOTA: Implementación rápida para presentación
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../../../../uploads/documentos/estudiantes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Estructura: uploads/documentos/estudiantes/temp/
    // Los archivos se guardan temporalmente aquí y luego se mueven a la ubicación correcta
    // en el controlador usando los datos del estudiante obtenidos de la BD
    const tipoDocumento = 'INSCRIPCION';
    const tempDir = path.join(uploadsDir, 'temp', tipoDocumento);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único temporal: {documentacion_id}_{timestamp}_{random}.extension
    // El controlador lo renombrará cuando lo mueva a la ubicación final
    const documentacionId = req.body?.documentacionId || 'doc';
    const estudianteId = req.params?.id || 'temp';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    const baseName = `${estudianteId}_${documentacionId}_${timestamp}_${random}${ext}`;
    cb(null, baseName);
  },
});

// Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
  // Permitir solo PDFs e imágenes
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF, JPEG, JPG o PNG'));
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: fileFilter,
});

export default upload;

