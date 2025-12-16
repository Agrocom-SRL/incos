/**
 * GET /api/v1/estudiantes/:id/documentos
 * Controller para obtener documentos de un estudiante
 */

import { logger } from '../../../shared/logger.js';
import container from '../../../infrastructure/container/index.js';

export class GetStudentDocumentsController {
  async handle(req, res, next) {
    try {
      const { id } = req.params;
      const estudianteId = parseInt(id);

      logger.info('Request de documentos de estudiante', {
        studentId: estudianteId,
      });

      if (isNaN(estudianteId)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID de estudiante inválido',
          },
        });
      }

      // Obtener repositorio de documentos
      const studentDocumentRepository = container.resolve('studentDocumentRepository');

      // Buscar documentos del estudiante
      const documentos = await studentDocumentRepository.findByEstudianteId(estudianteId);

      // Convertir entidades a formato de presentación (castellano)
      const documentosData = documentos.map((doc) => ({
        id: doc.id,
        estudianteId: doc.studentId,
        documentacionId: doc.documentacionId,
        motivoDocumento: doc.documentReason,
        tipoReferencia: doc.referenceType,
        referenciaId: doc.referenceId,
        descripcion: doc.description,
        nombreArchivo: doc.fileName,
        rutaArchivo: doc.filePath,
        extension: doc.extension,
        tamanoKb: doc.sizeKb,
        verificado: doc.verified,
        verificadoPor: doc.verifiedBy,
        fechaVerificacion: doc.verificationDate,
        observacionesVerificacion: doc.verificationObservations,
        estado: doc.state,
        esOriginal: doc.esOriginal,
        activo: doc.activo,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));

      logger.info('Documentos encontrados', {
        studentId: estudianteId,
        total: documentosData.length,
      });

      res.status(200).json({
        success: true,
        data: documentosData,
        message: 'Documentos obtenidos correctamente',
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error al obtener documentos de estudiante', {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }
}

