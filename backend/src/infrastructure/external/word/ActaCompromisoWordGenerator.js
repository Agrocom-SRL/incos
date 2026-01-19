/**
 * ActaCompromisoWordGenerator
 * 
 * Genera el ACTA DE COMPROMISO PARA LA ENTREGA DE DOCUMENTOS
 * usando la plantilla institucional de Word (.docx) con el header y estilos correctos.
 * 
 * Esta versión manipula directamente el XML del documento Word, por lo que
 * NO requiere placeholders en la plantilla. Funciona con cualquier plantilla
 * que tenga el header institucional.
 * 
 * Ventajas sobre PDF:
 * - Mantiene el formato institucional (header con logo)
 * - Documento editable
 * - Estilos consistentes con otros documentos del instituto
 * 
 * @module ActaCompromisoWordGenerator
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PizZip from 'pizzip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ActaCompromisoWordGenerator {
  /**
   * Ruta a la plantilla base (debe estar en el proyecto)
   * La plantilla debe tener:
   * - Header con logo institucional
   * - Título "FORMULARIO DE INSCRIPCIÓN" (será reemplazado)
   * - "GESTIÓN XXXX" (será reemplazado)
   */
  static TEMPLATE_PATH = path.join(__dirname, '../templates/Plantilla.docx');

  /**
   * Genera el acta de compromiso usando la plantilla Word
   * 
   * @param {Object} data - Datos del estudiante y compromiso
   * @param {string} data.nombreCompleto - Nombre completo del estudiante
   * @param {string} data.ci - Cédula de identidad
   * @param {string} data.expedicion - Lugar de expedición del CI (default: 'S.C.')
   * @param {string} data.ciudad - Ciudad donde se firma el acta
   * @param {Date|string} data.fecha - Fecha del acta (default: fecha actual)
   * @param {number} data.dia - Día del mes
   * @param {string} data.mes - Nombre del mes
   * @param {number} data.anio - Año
   * @param {string} data.anioCarrera - Año de la carrera (opcional)
   * @param {string} data.paralelo - Paralelo (opcional)
   * @param {string} data.carrera - Nombre de la carrera (opcional)
   * @param {Array<string>} data.documentosRequeridos - Lista de documentos requeridos
   * @param {Array<number>} data.documentosEntregados - Índices de documentos ya entregados
   * @param {number} data.plazoMaximo - Plazo en días para completar documentos (default: 10)
   * @param {string} data.motivos - Motivos por los que no se presentaron documentos
   * @param {string} outputPath - Ruta donde guardar el DOCX generado
   * 
   * @returns {Promise<string>} Ruta del archivo generado
   */
  static async generate(data, outputPath) {
    try {
      // 1. Verificar que existe la plantilla
      if (!fs.existsSync(this.TEMPLATE_PATH)) {
        throw new Error(
          `No se encontró la plantilla en: ${this.TEMPLATE_PATH}\n` +
          `Por favor, coloca tu plantilla Word (Plantilla.docx) en la carpeta templates/`
        );
      }

      // 2. Leer la plantilla como buffer
      const templateBuffer = fs.readFileSync(this.TEMPLATE_PATH);

      // 3. Cargar el DOCX con PizZip (DOCX es un archivo ZIP)
      const zip = new PizZip(templateBuffer);

      // 4. Obtener el XML del documento
      const documentXml = zip.files['word/document.xml'];
      if (!documentXml) {
        throw new Error('No se encontró word/document.xml en la plantilla');
      }

      // 5. Modificar el XML con los datos del acta
      let xmlContent = documentXml.asText();
      xmlContent = this._modifyDocumentXml(xmlContent, data);

      // 6. Actualizar el XML en el ZIP
      zip.file('word/document.xml', xmlContent);

      // 7. Generar el buffer del documento modificado
      const outputBuffer = zip.generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      });

      // 8. Crear directorio de salida si no existe
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // 9. Guardar el documento
      fs.writeFileSync(outputPath, outputBuffer);

      console.log(`[ActaCompromisoWordGenerator] ✅ Documento generado: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('[ActaCompromisoWordGenerator] ❌ Error:', error.message);
      console.error('[ActaCompromisoWordGenerator] Stack:', error.stack);
      throw error;
    }
  }

  /**
   * Modifica el XML del documento con los datos del acta
   * @private
   */
  static _modifyDocumentXml(xmlContent, data) {
    // Reemplazar el título "FORMULARIO DE INSCRIPCIÓN" con "ACTA DE COMPROMISO..."
    xmlContent = xmlContent.replace(
      /FORMULARIO DE INSCRIPCIÓN/g,
      'ACTA DE COMPROMISO PARA LA ENTREGA DE DOCUMENTOS'
    );

    // Reemplazar "GESTIÓN 2026" con la gestión actual
    const anio = data.anio || new Date().getFullYear();
    xmlContent = xmlContent.replace(
      /GESTIÓN \d{4}/g,
      `GESTIÓN ${anio}`
    );

    // Construir el contenido del acta
    const contenidoActa = this._buildActaContent(data);

    // Insertar el contenido después del título y gestión
    // Buscar el último </w:p> después de "GESTIÓN" y agregar el contenido
    const gestionIndex = xmlContent.indexOf(`GESTIÓN ${anio}`);
    if (gestionIndex === -1) {
      // Si no encuentra "GESTIÓN XXXX", buscar solo "GESTIÓN" o insertar después del título
      const tituloIndex = xmlContent.indexOf('ACTA DE COMPROMISO PARA LA ENTREGA DE DOCUMENTOS');
      if (tituloIndex === -1) {
        throw new Error('No se encontró el título en la plantilla. Asegúrate de que tenga "FORMULARIO DE INSCRIPCIÓN" o "ACTA DE COMPROMISO..."');
      }
      
      // Buscar el cierre del párrafo del título
      const tituloEnd = xmlContent.indexOf('</w:p>', tituloIndex);
      if (tituloEnd === -1) {
        throw new Error('No se encontró el cierre de párrafo después del título');
      }
      
      const before = xmlContent.substring(0, tituloEnd + 6);
      const after = xmlContent.substring(tituloEnd + 6);
      xmlContent = before + contenidoActa + after;
    } else {
      const tituloEnd = xmlContent.indexOf('</w:p>', gestionIndex);
      if (tituloEnd === -1) {
        throw new Error('No se encontró el cierre de párrafo después de GESTIÓN');
      }

      const before = xmlContent.substring(0, tituloEnd + 6);
      const after = xmlContent.substring(tituloEnd + 6);
      xmlContent = before + contenidoActa + after;
    }

    return xmlContent;
  }

  /**
   * Construye el contenido XML del acta
   * @private
   */
  static _buildActaContent(data) {
    const {
      nombreCompleto = '',
      ci = '',
      expedicion = 'S.C.',
      ciudad = 'Santa Cruz de la Sierra',
      dia = new Date().getDate(),
      mes = this._getMonthName(new Date().getMonth()),
      anio = new Date().getFullYear(),
      anioCarrera = '',
      paralelo = '',
      carrera = '',
      documentosRequeridos = [
        'Copia simple del Diploma de Bachiller',
        'Copia Simple Certificado de nacimiento',
        'Copia simple del Carnet de identidad',
        'Una foto 3 x 3 fondo rojo',
        'Folder con nepaco',
      ],
      documentosEntregados = [],
      plazoMaximo = 10,
      motivos = 'Actualización de carta aval del presente año.',
    } = data;

    // Construir secciones del acta
    let contenido = '';

    // I. FECHA DE REGISTRO
    contenido += this._createSection('I. FECHA DE REGISTRO');
    contenido += this._createParagraph(
      `En la ciudad de ${ciudad}, ${dia} de ${mes} de ${anio}`,
      { indent: 400 }
    );
    contenido += this._createSpacing(200);

    // II. NOMBRE COMPLETO Y NUMERO DE IDENTIFICACION
    contenido += this._createSection('II. NOMBRE COMPLETO Y NUMERO DE IDENTIFICACION');
    contenido += this._createParagraph(`Yo ${nombreCompleto}`, { indent: 400 });
    contenido += this._createParagraph(`con C.I. Nº ${ci} ${expedicion}`, { indent: 400 });
    contenido += this._createSpacing(200);

    // III. AÑO Y CARRERA (solo si hay datos académicos)
    if (carrera || anioCarrera || paralelo) {
      contenido += this._createSection('III. AÑO Y CARRERA A LA QUE POSTULA');
      if (anioCarrera) contenido += this._createParagraph(`Del ${anioCarrera} Año`, { indent: 400 });
      if (paralelo) contenido += this._createParagraph(`Paralelo: ${paralelo}`, { indent: 400 });
      if (carrera) contenido += this._createParagraph(`Carrera: ${carrera}`, { indent: 400 });
      contenido += this._createSpacing(200);
    }

    // REQUISITOS
    const seccionRequisitos = (carrera || anioCarrera || paralelo) ? 'IV' : 'III';
    contenido += this._createSection(`${seccionRequisitos}. REQUISITOS`);
    contenido += this._createParagraph(
      'Marcar con una "X" en el recuadro los requisitos que ya fueron presentados.',
      { bold: true, fontSize: 22 } // 11pt
    );
    contenido += this._createSpacing(100);

    // Checklist de documentos
    documentosRequeridos.forEach((doc, index) => {
      const checked = documentosEntregados.includes(index);
      contenido += this._createCheckboxItem(`${index + 1}. ${doc}`, checked);
    });

    contenido += this._createSpacing(200);

    // COMPROMISO
    contenido += this._createParagraph(
      'Me comprometo completar la documentación Faltante.',
      { indent: 400 }
    );
    contenido += this._createParagraph(
      `En un plazo máximo de ${plazoMaximo} días, a partir de la fecha de registro.`,
      { indent: 400 }
    );
    contenido += this._createSpacing(200);

    // MOTIVOS
    contenido += this._createParagraph(
      'Mencione los motivos por lo que no ha presentado los mencionados documentos:',
      { indent: 400 }
    );
    contenido += this._createSpacing(100);
    contenido += this._createTextBox(motivos);
    contenido += this._createSpacing(200);

    // DECLARACIÓN FINAL
    contenido += this._createParagraph(
      'Una vez vencido el plazo y en caso de no haber completado los requisitos exigidos por el ' +
      'Instituto Técnico INCOS SANTA CRUZ; me sujeto a las disposiciones de las Autoridades del Instituto.',
      { fontSize: 20, indent: 400 } // 10pt
    );
    contenido += this._createSpacing(400);

    // FIRMA
    contenido += this._createSignature(ci, expedicion);

    return contenido;
  }

  /**
   * Crea una sección con título (negrita, verde, izquierda)
   * @private
   */
  static _createSection(title) {
    return `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:before="240" w:after="120"/>
        <w:jc w:val="left"/>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:b/>
          <w:color w:val="287663"/>
          <w:sz w:val="24"/>
          <w:szCs w:val="24"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:b/>
          <w:color w:val="287663"/>
          <w:sz w:val="24"/>
          <w:szCs w:val="24"/>
        </w:rPr>
        <w:t>${this._escapeXml(title)}</w:t>
      </w:r>
    </w:p>`;
  }

  /**
   * Crea un párrafo de texto normal
   * @private
   */
  static _createParagraph(text, options = {}) {
    const {
      indent = 0,
      bold = false,
      fontSize = 20, // 10pt por defecto
      align = 'left',
    } = options;

    return `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:after="120"/>
        ${indent > 0 ? `<w:ind w:left="${indent}"/>` : ''}
        <w:jc w:val="${align}"/>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          ${bold ? '<w:b/>' : ''}
          <w:sz w:val="${fontSize}"/>
          <w:szCs w:val="${fontSize}"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          ${bold ? '<w:b/>' : ''}
          <w:sz w:val="${fontSize}"/>
          <w:szCs w:val="${fontSize}"/>
        </w:rPr>
        <w:t>${this._escapeXml(text)}</w:t>
      </w:r>
    </w:p>`;
  }

  /**
   * Crea un item de checkbox con su label
   * @private
   */
  static _createCheckboxItem(label, checked) {
    const checkSymbol = checked ? '☒' : '☐';
    
    return `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:after="100"/>
        <w:ind w:left="400"/>
        <w:jc w:val="left"/>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="22"/>
          <w:szCs w:val="22"/>
        </w:rPr>
        <w:t xml:space="preserve">${checkSymbol} </w:t>
      </w:r>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>${this._escapeXml(label)}</w:t>
      </w:r>
    </w:p>`;
  }

  /**
   * Crea un cuadro de texto con borde
   * @private
   */
  static _createTextBox(text) {
    return `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:pBdr>
          <w:top w:val="single" w:sz="8" w:space="1" w:color="auto"/>
          <w:left w:val="single" w:sz="8" w:space="4" w:color="auto"/>
          <w:bottom w:val="single" w:sz="8" w:space="1" w:color="auto"/>
          <w:right w:val="single" w:sz="8" w:space="4" w:color="auto"/>
        </w:pBdr>
        <w:spacing w:after="200"/>
        <w:ind w:left="400" w:right="400"/>
        <w:jc w:val="left"/>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>${this._escapeXml(text)}</w:t>
      </w:r>
    </w:p>`;
  }

  /**
   * Crea el área de firma
   * @private
   */
  static _createSignature(ci, expedicion) {
    return `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:before="600" w:after="100"/>
        <w:jc w:val="center"/>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>_____________________________________</w:t>
      </w:r>
    </w:p>
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:after="80"/>
        <w:jc w:val="center"/>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>Firma</w:t>
      </w:r>
    </w:p>
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:after="80"/>
        <w:jc w:val="center"/>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>C.I.: ${this._escapeXml(ci)} ${this._escapeXml(expedicion)}</w:t>
      </w:r>
    </w:p>`;
  }

  /**
   * Crea un espacio vertical
   * @private
   */
  static _createSpacing(height) {
    return `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:after="${height}"/>
      </w:pPr>
    </w:p>`;
  }


  /**
   * Escapa caracteres especiales XML
   * @private
   */
  static _escapeXml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x2019;'); // Comilla simple curva
  }

  /**
   * Genera un ID único para elementos XML (< 0x80000000)
   * @private
   */
  static _generateId() {
    return Math.floor(Math.random() * 0x7FFFFFFF).toString(16).toUpperCase().padStart(8, '0');
  }

  /**
   * Obtiene el nombre del mes en español
   * @private
   */
  static _getMonthName(monthIndex) {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return meses[monthIndex] || '';
  }
}
