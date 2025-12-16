/**
 * POST /api/v1/estudiantes/:id/documentos
 * Controller para subir documentos de estudiante
 * 
 * NOTA: Implementación rápida para presentación
 */

import { logger } from '../../../shared/logger.js';
import container from '../../../infrastructure/container/index.js';
import upload from '../../../infrastructure/external/storage/multer.config.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Middleware de multer para un solo archivo
export const uploadSingle = upload.single('archivo');

/**
 * Maneja la subida de un documento
 */
export class UploadDocumentController {
  constructor({ uploadDocumentUseCase }) {
    this.uploadDocumentUseCase = uploadDocumentUseCase;
  }

  async handle(req, res, next) {
    try {
      logger.info('UploadDocumentController - Iniciando subida de documento', {
        method: req.method,
        url: req.url,
        params: req.params,
        body: req.body,
        hasFile: !!req.file,
        fileInfo: req.file ? {
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        } : null,
      });

      const estudianteId = parseInt(req.params.id);
      const { documentacionId, esOriginal = false } = req.body;
      const file = req.file;

      if (!file) {
        logger.warn('UploadDocumentController - No se proporcionó archivo', {
          estudianteId,
          documentacionId,
          body: req.body,
        });
        return res.status(400).json({
          success: false,
          error: 'No se proporcionó ningún archivo',
        });
      }

      if (!documentacionId) {
        logger.warn('UploadDocumentController - No se proporcionó documentacionId', {
          estudianteId,
          body: req.body,
        });
        return res.status(400).json({
          success: false,
          error: 'El ID de documentación es requerido',
        });
      }

      // Obtener datos del estudiante para construir la ruta correcta
      const studentRepository = container.resolve('studentRepository');
      const student = await studentRepository.findById(estudianteId);
      
      logger.info('UploadDocumentController - Estudiante buscado', {
        estudianteId,
        encontrado: !!student,
        studentId: student?.id,
      });
      
      if (!student) {
        logger.warn('UploadDocumentController - Estudiante no encontrado', { estudianteId });
        return res.status(404).json({
          success: false,
          error: 'Estudiante no encontrado',
        });
      }

      // Obtener información de la documentación
      const documentacionRepository = container.resolve('documentacionRepository');
      const parsedDocumentacionId = parseInt(documentacionId);
      
      logger.info('UploadDocumentController - Buscando documentación', {
        documentacionIdOriginal: documentacionId,
        documentacionIdParsed: parsedDocumentacionId,
        tipoDocumentacionId: typeof documentacionId,
        bodyCompleto: req.body,
      });
      
      // Buscar documentación sin filtrar por activo para debugging
      const documentacion = await documentacionRepository.findById(parsedDocumentacionId);

      logger.info('UploadDocumentController - Documentación buscada', {
        documentacionId: parsedDocumentacionId,
        encontrada: !!documentacion,
        active: documentacion?.active,
        tipoActive: typeof documentacion?.active,
        documentacionData: documentacion ? {
          id: documentacion.id,
          nombre: documentacion.name,
          active: documentacion.active,
          tipoActive: typeof documentacion.active,
          tipoDocumento: documentacion.documentType,
        } : null,
      });

      if (!documentacion) {
        logger.warn('UploadDocumentController - Documentación no encontrada', {
          documentacionId: parsedDocumentacionId,
        });
        return res.status(404).json({
          success: false,
          error: 'Tipo de documentación no encontrado',
        });
      }

      // Verificar si está activa
      // BaseEntity usa 'active' (inglés), no 'activo' (español)
      if (!documentacion.active) {
        logger.warn('UploadDocumentController - Documentación inactiva', {
          documentacionId: parsedDocumentacionId,
          active: documentacion.active,
          tipoActive: typeof documentacion.active,
        });
        return res.status(404).json({
          success: false,
          error: 'Tipo de documentación no encontrado',
        });
      }

      // Mover archivo a la estructura correcta: {estudianteId}/
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const uploadsBaseDir = path.join(__dirname, '../../../../uploads/documentos/estudiantes');
      // Usar el ID del estudiante directamente, no CI ni apellido
      const targetDir = path.join(uploadsBaseDir, estudianteId.toString());
      
      logger.info('Preparando subida de archivo', {
        estudianteId,
        ci: student.ci,
        apellido: student.apellidoPaterno,
        targetDir,
        filePath: file.path,
        fileOriginalName: file.originalname,
      });
      
      // Crear directorio si no existe
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        logger.info('Directorio creado', { targetDir });
      }

      // Generar nuevo nombre de archivo con documentacionId
      const ext = path.extname(file.originalname);
      const newFileName = `${documentacionId}_${Date.now()}${ext}`;
      const targetPath = path.join(targetDir, newFileName);

      // Mover archivo de temp a la ubicación final
      // file.path contiene la ruta temporal donde multer guardó el archivo
      if (file.path && file.path !== targetPath) {
        try {
          // Verificar que el archivo temporal existe
          if (fs.existsSync(file.path)) {
            fs.renameSync(file.path, targetPath);
            logger.info('Archivo movido exitosamente', {
              from: file.path,
              to: targetPath,
            });
          } else {
            logger.warn('Archivo temporal no encontrado, puede que ya esté en la ubicación correcta', {
              filePath: file.path,
              targetPath,
            });
          }
        } catch (moveError) {
          logger.error('Error al mover archivo', {
            error: moveError.message,
            from: file.path,
            to: targetPath,
          });
          // Si falla al mover, usar la ruta original
          // pero actualizar la referencia en la BD
        }
      }

      logger.info('Subida de documento', {
        estudianteId,
        documentacionId,
        documentacionNombre: documentacion.name,
        fileName: newFileName,
        targetPath,
      });

      // Implementación rápida: usar repositorio directamente
      const studentDocumentRepository = container.resolve('studentDocumentRepository');
      
      // Verificar que el archivo existe en la ruta final antes de guardar en BD
      const finalFilePath = fs.existsSync(targetPath) ? targetPath : file.path;
      
      // Guardar ruta relativa para la BD (sin la ruta absoluta del sistema)
      // La ruta relativa será: /uploads/documentos/estudiantes/{estudianteId}/{fileName}
      const relativeFilePath = `/uploads/documentos/estudiantes/${estudianteId}/${newFileName}`;
      
      logger.info('Guardando información del documento en BD', {
        targetPath,
        targetPathExists: fs.existsSync(targetPath),
        filePath: file.path,
        filePathExists: fs.existsSync(file.path),
        finalFilePath,
        relativeFilePath,
      });
      
      const documentData = {
        studentId: estudianteId,
        documentacionId: parseInt(documentacionId),
        documentReason: documentacion.name,
        referenceType: 'inscripciones',
        description: documentacion.description || documentacion.name,
        fileName: newFileName,
        filePath: relativeFilePath, // Ruta relativa para la BD
        extension: ext.substring(1),
        sizeKb: Math.round(file.size / 1024),
        verified: false,
        state: 'PENDIENTE',
        esOriginal: esOriginal === 'true' || esOriginal === true,
      };

      const document = await studentDocumentRepository.create(documentData, req.user?.id);

      res.status(201).json({
        success: true,
        data: {
          id: document.id,
          documentacionId: document.documentacionId,
          nombreArchivo: document.fileName,
          rutaArchivo: document.filePath,
          extension: document.extension,
          tamanoKb: document.sizeKb,
          estado: document.state,
          esOriginal: document.esOriginal,
        },
        message: 'Documento subido correctamente',
      });
    } catch (error) {
      logger.error('Error al subir documento', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}

