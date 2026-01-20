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
      const outputPdfPath = pdfPath || docxPath.replace('.docx', '.pdf');

      // 3. Detectar el comando de LibreOffice
      const sofficeCommand = this._getLibreOfficeCommand();
      
      // 4. Verificar que LibreOffice está instalado
      try {
        execSync(`"${sofficeCommand}" --version`, { 
          encoding: 'utf-8', 
          stdio: 'pipe',
          env: { ...process.env, HOME: process.env.HOME || '/var/www', TMPDIR: '/tmp' }
        });
      } catch (error) {
        throw new Error(
          'LibreOffice no está instalado.\n' +
          'Instálalo con:\n' +
          '  macOS: brew install --cask libreoffice\n' +
          '  Ubuntu/Debian: sudo apt-get install libreoffice\n' +
          '  CentOS/RHEL: sudo yum install libreoffice'
        );
      }

      // 5. Copiar DOCX a /tmp para evitar problemas de permisos
      const tempDir = '/tmp';
      const docxBaseName = path.basename(docxPath);
      const tempDocxPath = path.join(tempDir, docxBaseName);
      
      console.log('[WordToPdfConverter] Copiando DOCX a /tmp...');
      fs.copyFileSync(docxPath, tempDocxPath);

      // 6. Convertir DOCX a PDF usando LibreOffice en /tmp
      console.log('[WordToPdfConverter] Convirtiendo DOCX a PDF...');
      console.log(`[WordToPdfConverter] LibreOffice: ${sofficeCommand}`);
      console.log(`[WordToPdfConverter] Input: ${tempDocxPath}`);
      console.log(`[WordToPdfConverter] Output: ${outputPdfPath}`);

      const command = `"${sofficeCommand}" --headless --convert-to pdf --outdir "${tempDir}" "${tempDocxPath}"`;
      
      try {
        const result = execSync(command, {
          encoding: 'utf-8',
          timeout: 60000,
          stdio: 'pipe',
          cwd: tempDir,
          env: { 
            ...process.env, 
            HOME: process.env.HOME || '/var/www', 
            TMPDIR: '/tmp',
            SAL_USE_VCLPLUGIN: 'svp',
            PATH: process.env.PATH || '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
          }
        });
        console.log('[WordToPdfConverter] Salida:', result.trim());
      } catch (conversionError) {
        console.error('[WordToPdfConverter] Error completo:', conversionError.message);
        console.error('[WordToPdfConverter] Stderr:', conversionError.stderr?.toString());
        console.error('[WordToPdfConverter] Stdout:', conversionError.stdout?.toString());
        
        // Limpiar archivo temporal
        if (fs.existsSync(tempDocxPath)) {
          fs.unlinkSync(tempDocxPath);
        }
        
        throw conversionError;
      }

      // 7. Verificar que el PDF fue generado en /tmp
      const pdfBaseName = docxBaseName.replace('.docx', '.pdf');
      const tempPdfPath = path.join(tempDir, pdfBaseName);
      
      // Esperar a que el archivo se escriba completamente
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!fs.existsSync(tempPdfPath)) {
        // Limpiar archivo temporal
        if (fs.existsSync(tempDocxPath)) {
          fs.unlinkSync(tempDocxPath);
        }
        
        throw new Error(
          `El PDF no fue generado por LibreOffice.\n` +
          `Buscado en: ${tempPdfPath}`
        );
      }

      // 8. Mover el PDF a su ubicación final
      const targetDir = path.dirname(outputPdfPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      console.log(`[WordToPdfConverter] Moviendo PDF de ${tempPdfPath} a ${outputPdfPath}`);
      fs.copyFileSync(tempPdfPath, outputPdfPath);

      // 9. Limpiar archivos temporales
      if (fs.existsSync(tempDocxPath)) {
        fs.unlinkSync(tempDocxPath);
      }
      if (fs.existsSync(tempPdfPath)) {
        fs.unlinkSync(tempPdfPath);
      }

      // 10. Verificación final
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
      execSync(`"${command}" --version`, { 
        encoding: 'utf-8', 
        stdio: 'pipe',
        env: { ...process.env, HOME: process.env.HOME || '/var/www', TMPDIR: '/tmp' }
      });
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
      const output = execSync(`"${command}" --version`, { 
        encoding: 'utf-8', 
        stdio: 'pipe',
        env: { ...process.env, HOME: process.env.HOME || '/var/www', TMPDIR: '/tmp' }
      });
      return output.trim();
    } catch (error) {
      return null;
    }
  }
}
