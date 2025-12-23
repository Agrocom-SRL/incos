/**
 * GET /api/v1/estudiantes/:id/acta-compromiso
 * Controller para generar y descargar el ACTA DE COMPROMISO
 */

import { logger } from '../../../shared/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GenerateCompromisoActaController {
  constructor({ generateCompromisoActaUseCase }) {
    this.generateCompromisoActaUseCase = generateCompromisoActaUseCase;
  }

  async handle(req, res, next) {
    try {
      const estudianteId = parseInt(req.params.id);
      
      // Opciones opcionales (solo motivos personalizados y plazo)
      const { motivos, plazoMaximo } = req.query;

      logger.info('Generando ACTA DE COMPROMISO', {
        estudianteId,
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

      // Opciones opcionales (solo para personalizar motivos o plazo)
      const options = {};
      if (motivos) {
        options.motivos = motivos;
      }
      if (plazoMaximo) {
        options.plazoMaximo = parseInt(plazoMaximo);
      }

      // Generar el PDF (todos los datos se recuperan automáticamente)
      const result = await this.generateCompromisoActaUseCase.execute(estudianteId, options);

      // Construir ruta absoluta
      const absolutePath = path.join(
        __dirname,
        '../../../../uploads/documentos/estudiantes',
        estudianteId.toString(),
        result.fileName
      );

      // Verificar que el archivo existe
      if (!fs.existsSync(absolutePath)) {
        logger.error('Archivo PDF no encontrado después de generación', {
          absolutePath,
          result,
        });
        return res.status(500).json({
          success: false,
          error: 'Error al generar el archivo PDF',
        });
      }

      // Enviar archivo como descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${result.fileName}"`
      );

      const fileStream = fs.createReadStream(absolutePath);
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        logger.error('Error al leer archivo PDF', {
          error: error.message,
          absolutePath,
        });
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Error al leer el archivo PDF',
          });
        }
      });
    } catch (error) {
      logger.error('Error al generar ACTA DE COMPROMISO', {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }
}

