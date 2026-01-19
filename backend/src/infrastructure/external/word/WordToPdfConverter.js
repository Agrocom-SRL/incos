/**
 * WordToPdfConverter
 * 
 * Utilidad para convertir documentos Word (.docx) a PDF usando LibreOffice.
 * 
 * Requisitos:
 * - LibreOffice instalado en el servidor (soffice command)
 * - En Ubuntu/Debian: sudo apt-get install libreoffice
 * - En CentOS/RHEL: sudo yum install libreoffice
 * 
 * @module WordToPdfConverter
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export class WordToPdfConverter {
  /**
   * Convierte un archivo DOCX a PDF usando LibreOffice
   * 
   * @param {string} docxPath - Ruta absoluta del archivo .docx
   * @param {string} pdfPath - Ruta absoluta donde guardar el .pdf (opcional)
   * @returns {Promise<string>} Ruta del archivo PDF generado
   * 
   * @example
   * const pdfPath = await WordToPdfConverter.convert(
   *   '/path/to/acta.docx',
   *   '/path/to/acta.pdf'
   * );
   */
  static async convert(docxPath, pdfPath = null) {
    try {
      // 1. Verificar que el archivo DOCX existe
      if (!fs.existsSync(docxPath)) {
        throw new Error(`El archivo DOCX no existe: ${docxPath}`);
      }

      // 2. Determinar ruta de salida del PDF
      const outputDir = path.dirname(docxPath);
      const outputPdfPath = pdfPath || docxPath.replace('.docx', '.pdf');

      // 3. Verificar que LibreOffice está instalado
      try {
        execSync('soffice --version', { encoding: 'utf-8', stdio: 'pipe' });
      } catch (error) {
        throw new Error(
          'LibreOffice no está instalado. ' +
          'Instálalo con: sudo apt-get install libreoffice (Ubuntu/Debian) ' +
          'o sudo yum install libreoffice (CentOS/RHEL)'
        );
      }

      // 4. Convertir DOCX a PDF usando LibreOffice
      console.log('[WordToPdfConverter] Convirtiendo DOCX a PDF...');
      console.log(`[WordToPdfConverter] Input: ${docxPath}`);
      console.log(`[WordToPdfConverter] Output: ${outputPdfPath}`);

      const command = `soffice --headless --convert-to pdf --outdir "${outputDir}" "${docxPath}"`;
      
      execSync(command, {
        encoding: 'utf-8',
        timeout: 60000, // 60 segundos timeout
        stdio: 'pipe', // No mostrar output en consola
      });

      // 5. LibreOffice genera el PDF con el mismo nombre que el DOCX en el directorio de salida
      // El PDF se genera en outputDir con el mismo nombre base que el DOCX
      const docxBaseName = path.basename(docxPath, '.docx');
      const generatedPdfPath = path.join(outputDir, `${docxBaseName}.pdf`);

      // 6. Esperar un momento para asegurar que el archivo se haya escrito completamente
      await new Promise(resolve => setTimeout(resolve, 500));

      // 7. Verificar que el PDF fue generado
      if (!fs.existsSync(generatedPdfPath)) {
        // Intentar buscar el PDF en el directorio de salida con diferentes nombres
        const possiblePaths = [
          outputPdfPath,
          generatedPdfPath,
          path.join(outputDir, path.basename(outputPdfPath)),
        ];
        
        let foundPdfPath = null;
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            foundPdfPath = possiblePath;
            break;
          }
        }
        
        if (!foundPdfPath) {
          throw new Error(
            `El PDF no fue generado por LibreOffice. ` +
            `Buscado en: ${generatedPdfPath}, ${outputPdfPath}. ` +
            `Verifica los logs de LibreOffice para más detalles.`
          );
        }
        
        // Si se encontró en una ubicación diferente, moverlo a la ubicación deseada
        if (foundPdfPath !== outputPdfPath) {
          const targetDir = path.dirname(outputPdfPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          
          if (path.dirname(foundPdfPath) === targetDir) {
            // Mismo directorio - renombrar
            fs.renameSync(foundPdfPath, outputPdfPath);
          } else {
            // Diferente directorio - copiar y eliminar
            fs.copyFileSync(foundPdfPath, outputPdfPath);
            fs.unlinkSync(foundPdfPath);
          }
        }
      } else {
        // El PDF se generó en la ubicación esperada, pero puede necesitar moverse
        if (generatedPdfPath !== outputPdfPath) {
          const targetDir = path.dirname(outputPdfPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          
          if (path.dirname(generatedPdfPath) === targetDir) {
            // Mismo directorio - renombrar
            fs.renameSync(generatedPdfPath, outputPdfPath);
          } else {
            // Diferente directorio - copiar y eliminar
            fs.copyFileSync(generatedPdfPath, outputPdfPath);
            fs.unlinkSync(generatedPdfPath);
          }
        }
      }

      // 8. Verificación final: el PDF debe existir en la ubicación deseada
      if (!fs.existsSync(outputPdfPath)) {
        throw new Error(
          `El PDF no se encuentra en la ubicación esperada: ${outputPdfPath}. ` +
          `Verifica que LibreOffice tenga permisos de escritura.`
        );
      }

      console.log('[WordToPdfConverter] ✅ Conversión exitosa');
      console.log(`[WordToPdfConverter] PDF generado: ${outputPdfPath}`);

      return outputPdfPath;

    } catch (error) {
      console.error('[WordToPdfConverter] ❌ Error en conversión:', error.message);
      throw new Error(`Error al convertir DOCX a PDF: ${error.message}`);
    }
  }

  /**
   * Convierte un archivo DOCX a PDF y elimina el DOCX original
   * 
   * @param {string} docxPath - Ruta del archivo .docx
   * @param {string} pdfPath - Ruta donde guardar el .pdf (opcional)
   * @returns {Promise<string>} Ruta del archivo PDF generado
   */
  static async convertAndDelete(docxPath, pdfPath = null) {
    const pdfResult = await this.convert(docxPath, pdfPath);
    
    // Eliminar el DOCX original
    if (fs.existsSync(docxPath)) {
      fs.unlinkSync(docxPath);
      console.log(`[WordToPdfConverter] DOCX original eliminado: ${docxPath}`);
    }
    
    return pdfResult;
  }

  /**
   * Verifica si LibreOffice está instalado y disponible
   * 
   * @returns {boolean} true si LibreOffice está disponible
   */
  static isLibreOfficeAvailable() {
    try {
      execSync('soffice --version', { encoding: 'utf-8', stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene la versión de LibreOffice instalada
   * 
   * @returns {string|null} Versión de LibreOffice o null si no está instalado
   */
  static getLibreOfficeVersion() {
    try {
      const output = execSync('soffice --version', { encoding: 'utf-8', stdio: 'pipe' });
      return output.trim();
    } catch (error) {
      return null;
    }
  }
}
