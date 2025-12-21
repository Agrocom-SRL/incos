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
      const { documentosFaltantes, motivos, plazoMaximo, anioCarrera, paralelo, carrera } = req.query;

      logger.info('Generando ACTA DE COMPROMISO', {
        estudianteId,
        documentosFaltantes,
        motivos,
      });

      // Parsear documentos faltantes si viene como string
      let documentosFaltantesArray = [];
      if (documentosFaltantes) {
        if (typeof documentosFaltantes === 'string') {
          documentosFaltantesArray = documentosFaltantes.split(',').map(id => parseInt(id.trim()));
        } else if (Array.isArray(documentosFaltantes)) {
          documentosFaltantesArray = documentosFaltantes.map(id => parseInt(id));
        }
      }

      const options = {
        documentosFaltantes: documentosFaltantesArray,
        motivos: motivos || undefined,
        plazoMaximo: plazoMaximo ? parseInt(plazoMaximo) : undefined,
        anioCarrera: anioCarrera || undefined,
        paralelo: paralelo || undefined,
        carrera: carrera || undefined,
      };

      // Generar el PDF
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

