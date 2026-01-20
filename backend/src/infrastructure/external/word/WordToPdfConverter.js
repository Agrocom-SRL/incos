/**
 * WordToPdfConverter
 * 
 * Utilidad para convertir documentos Word (.docx) a PDF usando LibreOffice.
 * 
 * Requisitos:
 * - LibreOffice instalado en el servidor
 * - macOS: brew install --cask libreoffice
 * - Ubuntu/Debian: sudo apt-get install libreoffice
 * - CentOS/RHEL: sudo yum install libreoffice
 * 
 * @module WordToPdfConverter
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export class WordToPdfConverter {
  /**
   * Detecta el comando de LibreOffice según el sistema operativo
   * @private
   * @returns {string} Comando de soffice
   */
  static _getLibreOfficeCommand() {
    const platform = os.platform();

    // Intentar primero el wrapper personalizado (para producción con www-data)
    const productionPaths = [
      '/usr/local/bin/soffice-wrapper',
      '/usr/lib/libreoffice/program/soffice.bin',
    ];

    for (const sofficePath of productionPaths) {
      if (fs.existsSync(sofficePath)) {
        try {
          execSync(`"${sofficePath}" --version`, {
            encoding: 'utf-8',
            stdio: 'pipe',
            env: { ...process.env, HOME: process.env.HOME || '/var/www', TMPDIR: '/tmp' }
          });
          return sofficePath;
        } catch (error) {
          continue;
        }
      }
    }

    if (platform === 'darwin') {
      // macOS - ruta típica de LibreOffice instalado con Homebrew
      const macPaths = [
        '/Applications/LibreOffice.app/Contents/MacOS/soffice',
        '/usr/local/bin/soffice',
        'soffice'
      ];

      for (const sofficePath of macPaths) {
        try {
          execSync(`"${sofficePath}" --version`, { encoding: 'utf-8', stdio: 'pipe' });
          return sofficePath;
        } catch (error) {
          continue;
        }
      }
    }

    // Linux, Windows y otros - usar comando estándar
    return 'soffice';
  }

  /**
   * Convierte un archivo DOCX a PDF usando LibreOffice
   * 
   * @param {string} docxPath - Ruta absoluta del archivo .docx
   * @param {string} pdfPath - Ruta absoluta donde guardar el .pdf (opcional)
   * @returns {Promise<string>} Ruta del archivo PDF generado
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

      // 3. Detectar el comando de LibreOffice
      const sofficeCommand = this._getLibreOfficeCommand();

      // 4. Verificar que LibreOffice está instalado
      try {
        execSync(`"${sofficeCommand}" --version`, { encoding: 'utf-8', stdio: 'pipe' });
      } catch (error) {
        throw new Error(
          'LibreOffice no está instalado.\n' +
          'Instálalo con:\n' +
          '  macOS: brew install --cask libreoffice\n' +
          '  Ubuntu/Debian: sudo apt-get install libreoffice\n' +
          '  CentOS/RHEL: sudo yum install libreoffice'
        );
      }

      // 5. Convertir DOCX a PDF usando LibreOffice
      console.log('[WordToPdfConverter] Convirtiendo DOCX a PDF...');
      console.log(`[WordToPdfConverter] LibreOffice: ${sofficeCommand}`);
      console.log(`[WordToPdfConverter] Input: ${docxPath}`);
      console.log(`[WordToPdfConverter] Output: ${outputPdfPath}`);

      const command = `"${sofficeCommand}" --headless --convert-to pdf --outdir "${outputDir}" "${docxPath}"`;

      execSync(command, {
        encoding: 'utf-8',
        timeout: 60000, // 60 segundos timeout
        stdio: 'pipe',
        env: { 
          ...process.env, 
          HOME: process.env.HOME || '/var/www', 
          TMPDIR: '/tmp',
          PATH: process.env.PATH || '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
        }
      });

      // 6. LibreOffice genera el PDF con el mismo nombre que el DOCX
      const docxBaseName = path.basename(docxPath, '.docx');
      const generatedPdfPath = path.join(outputDir, `${docxBaseName}.pdf`);

      // 7. Esperar a que el archivo se escriba completamente
      await new Promise(resolve => setTimeout(resolve, 500));

      // 8. Verificar que el PDF fue generado
      if (!fs.existsSync(generatedPdfPath)) {
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
            `El PDF no fue generado por LibreOffice.\n` +
            `Buscado en: ${generatedPdfPath}, ${outputPdfPath}`
          );
        }

        // Mover a la ubicación deseada si es diferente
        if (foundPdfPath !== outputPdfPath) {
          const targetDir = path.dirname(outputPdfPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          if (path.dirname(foundPdfPath) === targetDir) {
            fs.renameSync(foundPdfPath, outputPdfPath);
          } else {
            fs.copyFileSync(foundPdfPath, outputPdfPath);
            fs.unlinkSync(foundPdfPath);
          }
        }
      } else {
        // Mover si es necesario
        if (generatedPdfPath !== outputPdfPath) {
          const targetDir = path.dirname(outputPdfPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          if (path.dirname(generatedPdfPath) === targetDir) {
            fs.renameSync(generatedPdfPath, outputPdfPath);
          } else {
            fs.copyFileSync(generatedPdfPath, outputPdfPath);
            fs.unlinkSync(generatedPdfPath);
          }
        }
      }

      // 9. Verificación final
      if (!fs.existsSync(outputPdfPath)) {
        throw new Error(`El PDF no se encuentra en: ${outputPdfPath}`);
      }

      console.log('[WordToPdfConverter] ✅ Conversión exitosa');
      console.log(`[WordToPdfConverter] PDF: ${outputPdfPath} (${fs.statSync(outputPdfPath).size} bytes)`);

      return outputPdfPath;

    } catch (error) {
      console.error('[WordToPdfConverter] ❌ Error:', error.message);
      throw new Error(`Error al convertir DOCX a PDF: ${error.message}`);
    }
  }

  /**
   * Convierte un archivo DOCX a PDF y elimina el DOCX original
   */
  static async convertAndDelete(docxPath, pdfPath = null) {
    const pdfResult = await this.convert(docxPath, pdfPath);

    if (fs.existsSync(docxPath)) {
      fs.unlinkSync(docxPath);
      console.log(`[WordToPdfConverter] DOCX eliminado: ${docxPath}`);
    }

    return pdfResult;
  }

  /**
   * Verifica si LibreOffice está disponible
   */
  static isLibreOfficeAvailable() {
    try {
      const command = this._getLibreOfficeCommand();
      execSync(`"${command}" --version`, { encoding: 'utf-8', stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene la versión de LibreOffice
   */
  static getLibreOfficeVersion() {
    try {
      const command = this._getLibreOfficeCommand();
      const output = execSync(`"${command}" --version`, { encoding: 'utf-8', stdio: 'pipe' });
      return output.trim();
    } catch (error) {
      return null;
    }
  }
}
