/**
 * POST /api/v1/estudiantes/:id/documentos
 * Controller para subir documentos de estudiante
 */

import { logger } from '../../../shared/logger.js';
import upload from '../../../infrastructure/external/storage/multer.config.js';

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

      if (!this.uploadDocumentUseCase) {
        throw new Error('UploadDocumentUseCase no está configurado');
      }

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

      const userId = req.user?.id || req.user?.userId;
      
      // Usar el use case
      const document = await this.uploadDocumentUseCase.execute(
        estudianteId,
        documentacionId,
        file,
        esOriginal,
        userId
      );

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

