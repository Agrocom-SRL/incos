/**
 * POST /api/v1/estudiantes/:id/documentos
 * Controller para subir documentos de estudiante
 */

import { logger } from '../../../shared/logger.js';
import { fileUploadService } from '../../../infrastructure/services/FileUploadService.js';

// OJO: el field name debe coincidir con tu service: .single('documento')
export const uploadSingle = fileUploadService.uploadStudentDocument();

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

      const estudianteId = parseInt(req.params.id, 10);
      const { tipoDocumento, documentacionId, contieneMultipleDocumentos = false } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionó ningún archivo',
        });
      }

      if (!tipoDocumento) {
        return res.status(400).json({
          success: false,
          error: 'El tipo de documento es requerido (INSCRIPCION, LICENCIA, etc.)',
        });
      }

      const userId = req.user?.id || req.user?.userId;

      const document = await this.uploadDocumentUseCase.execute(
        estudianteId,
        tipoDocumento,
        documentacionId || null,
        file,
        contieneMultipleDocumentos,
        userId
      );

      return res.status(201).json({
        success: true,
        data: {
          id: document.id,
          tipoDocumento: document.tipoDocumento,
          documentacionId: document.documentacionId,
          nombreArchivo: document.fileName,
          rutaArchivo: document.filePath,
          extension: document.extension,
          tipoMime: document.tipoMime,
          contieneMultipleDocumentos: document.contieneMultipleDocumentos,
          estado: document.state,
        },
        message: 'Documento subido correctamente',
      });
    } catch (error) {
      logger.error('Error al subir documento', { error: error.message, stack: error.stack });
      next(error);
    }
  }
}
