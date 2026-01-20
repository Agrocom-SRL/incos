/**
 * BoletaInscripcionWordGenerator - VERSIÓN CON PLANTILLA
 * 
 * Genera la BOLETA DE INSCRIPCIÓN para:
 * INSTITUTO COMERCIAL DE LA NACION INCOS SANTA CRUZ
 * 
 * Usa la plantilla Word (Plantilla.docx) y la modifica con PizZip.
 * Usa la información institucional de IncosPDFBase para mantener consistencia.
 * 
 * Características:
 * - Layout de 2 columnas para todo excepto nombre completo
 * - Fuente y tamaño uniforme para todo el contenido
 * - Colores desde IncosPDFBase
 * 
 * @module BoletaInscripcionWordGenerator
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PizZip from 'pizzip';
import { IncosPDFBase } from '../pdf/IncosPDFBase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BoletaInscripcionWordGenerator {
    static TEMPLATE_PATH = path.join(__dirname, '../templates/Plantilla.docx');

    // Estilos de fuente (tamaños en half-points: 1 punto = 2 half-points)
    static DEFAULT_FONT = 'Times New Roman';
    static DEFAULT_FONT_SIZE = 24; // 13 puntos = 26 half-points (tamaño normal)
    static SECTION_FONT_SIZE = 30; // 16 puntos = 32 half-points (títulos de sección)
    // Colores desde IncosPDFBase (sin el símbolo # para XML Word)
    static DATA_COLOR = IncosPDFBase.COLORS.primary.replace('#', ''); // Verde primario para datos

    /**
     * Genera el formulario de inscripción (Boleta) usando la plantilla Word
     * 
     * @param {Object} data - Datos del estudiante y formulario
     * @param {number} data.gestionYear - Año de gestión
     * @param {string} data.apellidoPaterno - Apellido paterno
     * @param {string} data.apellidoMaterno - Apellido materno
     * @param {string} data.nombres - Nombres
     * @param {string} data.ci - Cédula de identidad
     * @param {string} data.expedicion - Lugar de expedición del CI (default: 'S.C.')
     * @param {string} data.genero - Género (Masculino/Femenino)
     * @param {string} data.tipoSangre - Tipo sanguíneo
     * @param {string} data.emailPersonal - Email personal
     * @param {string} data.estadoCivil - Estado civil
     * @param {boolean} data.tieneDiscapacidad - Si tiene discapacidad
     * @param {string} data.ciudadNacimiento - Ciudad de nacimiento (Localidad)
     * @param {string} data.provincia - Provincia
     * @param {string} data.departamento - Departamento
     * @param {string} data.fechaNacimiento - Fecha de nacimiento (formato DD/MM/YYYY)
     * @param {string} data.nacionalidad - Nacionalidad
     * @param {string} data.edad - Edad
     * @param {string} data.direccion - Dirección (Domicilio)
     * @param {string} data.idiomaMaterno - Idioma materno (Idioma de origen)
     * @param {string} data.celular - Número de celular
     * @param {boolean} data.trabaja - Si trabaja
     * @param {string} data.cargo - Cargo (si trabaja)
     * @param {string} data.empresa - Empresa/Institución (si trabaja)
     * @param {string} data.carrera - Nombre de la carrera
     * @param {string} data.anio - Año académico (Primer Año, Segundo Año, Tercer Año)
     * @param {Object} data.documentos - Estado de documentos entregados
     * @param {boolean} data.documentos.ci - CI entregado
     * @param {boolean} data.documentos.certificadoNacimiento - Certificado entregado
     * @param {boolean} data.documentos.diplomaBachiller - Diploma entregado
     * @param {boolean} data.documentos.aporteVoluntario - Aporte realizado
     * @param {Array} data.materias - Array de materias del primer periodo
     * @param {string} data.materias[].sigla - Sigla de la materia
     * @param {string} data.materias[].nombre - Nombre de la materia
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

            // 5. Modificar el XML con los datos de la boleta
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

            console.log(`[BoletaInscripcionWordGenerator] ✅ Documento generado: ${outputPath}`);
            return outputPath;

        } catch (error) {
            console.error('[BoletaInscripcionWordGenerator] ❌ Error:', error.message);
            console.error('[BoletaInscripcionWordGenerator] Stack:', error.stack);
            throw error;
        }
    }

    /**
     * Modifica el XML del documento con los datos de la boleta
     * @private
     */
    static _modifyDocumentXml(xmlContent, data) {
        // Reemplazar el título si existe "FORMULARIO DE INSCRIPCIÓN"
        xmlContent = xmlContent.replace(
            /FORMULARIO DE INSCRIPCIÓN/g,
            'BOLETA DE INSCRIPCIÓN'
        );

        // Reemplazar nombre del instituto si existe
        xmlContent = xmlContent.replace(
            /INSTITUTO[^<]*INCOS[^<]*/g,
            IncosPDFBase.INSTITUTE.name
        );

        // Reemplazar "GESTIÓN 2026" o cualquier año con la gestión actual
        const anio = data.gestionYear || new Date().getFullYear();
        xmlContent = xmlContent.replace(
            /GESTIÓN \d{4}/g,
            `GESTIÓN ${anio}`
        );

        // Construir el contenido de la boleta
        const contenidoBoleta = this._buildBoletaContent(data);

        // Insertar el contenido después del título y gestión
        // Buscar el punto de inserción después de "GESTIÓN XXXX"
        const gestionPattern = `GESTIÓN ${anio}`;
        const gestionIndex = xmlContent.indexOf(gestionPattern);

        if (gestionIndex === -1) {
            // Si no encontramos GESTIÓN, buscar el título
            const tituloIndex = xmlContent.indexOf('BOLETA DE INSCRIPCIÓN');
            if (tituloIndex === -1) {
                throw new Error('No se encontró el título en la plantilla. Asegúrate de que tenga "FORMULARIO DE INSCRIPCIÓN" o "BOLETA DE INSCRIPCIÓN"');
            }

            const tituloEnd = xmlContent.indexOf('</w:p>', tituloIndex);
            if (tituloEnd === -1) {
                throw new Error('No se encontró el cierre de párrafo después del título');
            }

            const before = xmlContent.substring(0, tituloEnd + 6);
            const after = xmlContent.substring(tituloEnd + 6);
            xmlContent = before + contenidoBoleta + after;
        } else {
            const tituloEnd = xmlContent.indexOf('</w:p>', gestionIndex);
            if (tituloEnd === -1) {
                throw new Error('No se encontró el cierre de párrafo después de GESTIÓN');
            }

            const before = xmlContent.substring(0, tituloEnd + 6);
            const after = xmlContent.substring(tituloEnd + 6);
            xmlContent = before + contenidoBoleta + after;
        }

        return xmlContent;
    }

    /**
     * Construye el contenido XML del formulario de inscripción
     * COINCIDIENDO con la imagen final del usuario
     * @private
     */
    static _buildBoletaContent(data) {
        const {
            gestionYear = new Date().getFullYear(),
            apellidoPaterno = '',
            apellidoMaterno = '',
            nombres = '',
            ci = '',
            expedicion = 'S.C.',
            genero = '',
            tipoSangre = '',
            emailPersonal = '',
            estadoCivil = '',
            tieneDiscapacidad = false,
            ciudadNacimiento = '',
            provincia = '',
            departamento = '',
            fechaNacimiento = '',
            nacionalidad = 'Boliviana',
            edad = '',
            direccion = '',
            idiomaMaterno = '',
            celular = '',
            trabaja = false,
            cargo = '',
            empresa = '',
            carrera = '',
            anio = '',
            documentos = {},
            materias = [],
        } = data;

        // Parsear fecha de nacimiento
        const fechaParts = fechaNacimiento ? fechaNacimiento.split('/') : ['', '', ''];
        const dia = fechaParts[0] || '';
        const mes = fechaParts[1] || '';
        const año = fechaParts[2] || '';

        let contenido = '';

        // ============================================
        // SECCIÓN 1: DATOS PERSONALES
        // ============================================
        contenido += this._createSection('1.- DATOS PERSONALES', this.DEFAULT_FONT, this.SECTION_FONT_SIZE);

        // Nombre completo (una sola línea, sin columnas, con espacio como párrafo separado)
        contenido += this._createFullName(apellidoPaterno, apellidoMaterno, nombres);

        // Campos en 2 columnas usando tabla
        contenido += this._createDualColumnTable([
            { left: `C.I. Nº ${ci || '________'} ${expedicion || '____'}`, right: this._createGenderField(genero) },
            { left: `Grupo Sanguíneo: ${tipoSangre || '____'}`, right: `Correo Electrónico: ${emailPersonal || '____________'}` },
            { left: this._createCivilStatusField(estadoCivil), right: this._createDisabilityField(tieneDiscapacidad) },
        ]);

        // Lugar y Fecha de Nacimiento (segundo sector del bloque 1)
        contenido += this._createSubsection('Lugar y Fecha de Nacimiento', this.DEFAULT_FONT, this.DEFAULT_FONT_SIZE);
        contenido += this._createDualColumnTable([
            { left: `Localidad: ${ciudadNacimiento || '____'}`, right: `Provincia: ${provincia || '____'}` },
            { left: `Departamento: ${departamento || '____'}`, right: this._createBirthDateField(fechaNacimiento, nacionalidad, edad) },
        ]);

        contenido += this._createDualColumnTable([
            { left: `Domicilio: ${direccion || '____________'}`, right: `Idioma de origen: ${idiomaMaterno || '____'}` },
            { left: `Celular: ${celular || '____'}`, right: this._createWorkField(trabaja, cargo, empresa) },
        ]);

        // ============================================
        // SECCIÓN 2: DATOS ACADÉMICOS
        // ============================================
        contenido += this._createSection('2.- DATOS ACADÉMICOS', this.DEFAULT_FONT, this.SECTION_FONT_SIZE, IncosPDFBase.COLORS.primary.replace('#', ''));
        contenido += this._createCareerAndYearTable(carrera, anio);

        // Segundo sector del bloque 2: Materias (en 2 columnas)
        contenido += this._createSubsection('Materias del Primer Año', this.DEFAULT_FONT, this.DEFAULT_FONT_SIZE);
        contenido += this._createSubjectsTable(materias);

        // ============================================
        // SECCIÓN 3: DOCUMENTOS RECEPCIONADOS
        // ============================================
        contenido += this._createSection('3.- DOCUMENTOS RECEPCIONADOS', this.DEFAULT_FONT, this.SECTION_FONT_SIZE, IncosPDFBase.COLORS.primary.replace('#', ''));
        contenido += this._createDocumentsTable(documentos);

        // ============================================
        // FIRMAS
        // ============================================
        contenido += this._createSignaturesSection();

        // ============================================
        // NOTA LEGAL
        // ============================================
        contenido += this._createLegalNote();

        return contenido;
    }

    // ============================================
    // MÉTODOS AUXILIARES PARA GENERAR XML
    // ============================================

    /**
     * Crea una sección con título principal (solo títulos numerados tienen color)
     * @private
     */
    static _createSection(title, font = this.DEFAULT_FONT, fontSize = this.DEFAULT_FONT_SIZE, color = null) {
        // Solo aplicar color si se especifica (para títulos numerados)
        const colorAttr = color ? ` w:color="${color}"` : '';
        return `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:before="200" w:after="150"/>
        <w:rPr>
          <w:rFonts w:ascii="${font}" w:hAnsi="${font}"/>
          <w:b/>
          <w:sz w:val="${fontSize}"/>
          <w:szCs w:val="${fontSize}"/>
          ${colorAttr}
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="${font}" w:hAnsi="${font}"/>
          <w:b/>
          <w:sz w:val="${fontSize}"/>
          <w:szCs w:val="${fontSize}"/>
          ${colorAttr}
        </w:rPr>
        <w:t>${this._escapeXml(title)}</w:t>
      </w:r>
    </w:p>`;
    }

    /**
     * Crea un subtítulo (sin color, solo títulos numerados tienen color)
     * @private
     */
    static _createSubsection(title, font = this.DEFAULT_FONT, fontSize = this.DEFAULT_FONT_SIZE, color = null) {
        // Los subtítulos NO tienen color, solo los títulos numerados
        return `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:before="100" w:after="30"/>
        <w:rPr>
          <w:rFonts w:ascii="${font}" w:hAnsi="${font}"/>
          <w:b/>
          <w:sz w:val="${fontSize}"/>
          <w:szCs w:val="${fontSize}"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="${font}" w:hAnsi="${font}"/>
          <w:b/>
          <w:sz w:val="${fontSize}"/>
          <w:szCs w:val="${fontSize}"/>
        </w:rPr>
        <w:t>${this._escapeXml(title)}</w:t>
      </w:r>
    </w:p>`;
    }

    /**
     * Crea el nombre completo en una sola línea (sin columnas, con espacio como párrafo separado)
     * @private
     */
    static _createFullName(apellidoPaterno, apellidoMaterno, nombres) {
        return `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:before="100" w:after="150"/>
        <w:rPr>
          <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
          <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
          <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
          <w:b/>
          <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
          <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
        </w:rPr>
        <w:t>Nombres y Apellidos : </w:t>
      </w:r>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
          <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
          <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
        </w:rPr>
        <w:t xml:space="preserve">${this._escapeXml(`${apellidoPaterno} ${apellidoMaterno} ${nombres}`)}</w:t>
      </w:r>
    </w:p>`;
    }

    /**
     * Crea una tabla de 2 columnas para campos en formato lado a lado
     * @private
     */
    static _createDualColumnTable(fields) {
        let xml = `
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="none"/>
          <w:left w:val="none"/>
          <w:bottom w:val="none"/>
          <w:right w:val="none"/>
          <w:insideH w:val="none"/>
          <w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="4500"/>
        <w:gridCol w:w="4500"/>
      </w:tblGrid>`;

        fields.forEach((field) => {
            xml += `
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4500" w:type="dxa"/>
            <w:vAlign w:val="top"/>
          </w:tcPr>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:after="0"/>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:color w:val="${this.DATA_COLOR}"/>
              </w:rPr>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t>${this._escapeXml(field.left)}</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4500" w:type="dxa"/>
            <w:vAlign w:val="top"/>
          </w:tcPr>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:after="0"/>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:color w:val="${this.DATA_COLOR}"/>
              </w:rPr>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t>${this._escapeXml(field.right || '')}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>`;
        });

        xml += `
    </w:tbl>`;

        return xml;
    }

    /**
     * Crea el campo de género con checkboxes
     * @private
     */
    static _createGenderField(genero) {
        const isMasculino = genero === 'Masculino' || genero === 'M';
        const isFemenino = genero === 'Femenino' || genero === 'F';
        return `Género: ${isMasculino ? '[X]' : '[  ]'} Masculino ${isFemenino ? '[X]' : '[  ]'} Femenino`;
    }

    /**
     * Crea el campo de estado civil con checkboxes
     * @private
     */
    static _createCivilStatusField(estadoCivil) {
        const estadoLower = estadoCivil?.toLowerCase() || '';
        const isSoltero = estadoLower.includes('solter');
        const isCasado = estadoLower.includes('casad');
        const isConcubinato = estadoLower.includes('concubinat');
        return `Estado Civil: ${isSoltero ? '[X]' : '[  ]'} Soltero(a) ${isCasado ? '[X]' : '[  ]'} Casado(a) ${isConcubinato ? '[X]' : '[  ]'} Concubinato`;
    }

    /**
     * Crea el campo de discapacidad con checkboxes
     * @private
     */
    static _createDisabilityField(tieneDiscapacidad) {
        return `Discapacidad: ${tieneDiscapacidad === true ? '[X]' : '[  ]'} Si) ${tieneDiscapacidad === false ? '[X]' : '[  ]'} No)`;
    }

    /**
     * Crea el campo de fecha de nacimiento
     * @private
     */
    static _createBirthDateField(fechaNacimiento, nacionalidad, edad) {
        const fechaParts = fechaNacimiento ? fechaNacimiento.split('/') : ['', '', ''];
        return `Día ${fechaParts[0] || '____'} - Mes ${fechaParts[1] || '____'} Año ${fechaParts[2] || '____'} Nacionalidad ${nacionalidad || '____'} Edad ${edad || '____'}`;
    }

    /**
     * Crea el campo de trabajo
     * @private
     */
    static _createWorkField(trabaja, cargo, empresa) {
        const workText = `Trabaja: ${trabaja === true ? '[X]' : '[  ]'} Si) ${trabaja === false ? '[X]' : '[  ]'} No)`;
        if (trabaja) {
            return `${workText} Cargo: ${cargo || '____'} Empresa: ${empresa || '____'}`;
        }
        return workText;
    }

    /**
     * Crea la tabla de Carrera y Año
     * @private
     */
    static _createCareerAndYearTable(carrera, anio) {
        const carreraLower = carrera?.toLowerCase() || '';
        const isSistemas = carreraLower.includes('sistem') || carreraLower.includes('informát');
        const isAdministracion = carreraLower.includes('administración') || carreraLower.includes('administracion') || carreraLower.includes('empresas');
        const isContaduria = carreraLower.includes('contad');

        const isPrimerAnio = !anio || anio?.toLowerCase().includes('primer');
        const isSegundoAnio = anio?.toLowerCase().includes('segund');
        const isTercerAnio = anio?.toLowerCase().includes('tercer');

        return `
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="none"/>
          <w:left w:val="none"/>
          <w:bottom w:val="none"/>
          <w:right w:val="none"/>
          <w:insideH w:val="none"/>
          <w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="4500"/>
        <w:gridCol w:w="4500"/>
      </w:tblGrid>
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4500" w:type="dxa"/>
          </w:tcPr>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:after="0"/>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:b/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:b/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t>Carrera:</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4500" w:type="dxa"/>
          </w:tcPr>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:after="0"/>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:b/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:b/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t>Año:</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4500" w:type="dxa"/>
          </w:tcPr>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:after="0"/>
              <w:ind w:left="200"/>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t xml:space="preserve">${isSistemas ? '[X]' : '[  ]'} Sistemas Informáticos</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4500" w:type="dxa"/>
          </w:tcPr>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:after="0"/>
              <w:ind w:left="200"/>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t xml:space="preserve">${isPrimerAnio ? '[X]' : '[  ]'} Primer Año</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4500" w:type="dxa"/>
          </w:tcPr>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:after="0"/>
              <w:ind w:left="200"/>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t xml:space="preserve">${isAdministracion ? '[X]' : '[  ]'} Administración de Empresas</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4500" w:type="dxa"/>
          </w:tcPr>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:after="0"/>
              <w:ind w:left="200"/>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t xml:space="preserve">${isSegundoAnio ? '[X]' : '[  ]'} Segundo Año</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4500" w:type="dxa"/>
          </w:tcPr>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:after="0"/>
              <w:ind w:left="200"/>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t xml:space="preserve">${isContaduria ? '[X]' : '[  ]'} Contaduría General</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4500" w:type="dxa"/>
          </w:tcPr>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:after="0"/>
              <w:ind w:left="200"/>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t xml:space="preserve">${isTercerAnio ? '[X]' : '[  ]'} Tercer Año</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:before="100" w:after="100"/>
      </w:pPr>
    </w:p>`;
    }

    /**
     * Crea la tabla de Materias (en 2 columnas)
     * @private
     */
    static _createSubjectsTable(materias) {
        if (!materias || materias.length === 0) {
            return '';
        }

        let xml = `
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="none"/>
          <w:left w:val="none"/>
          <w:bottom w:val="none"/>
          <w:right w:val="none"/>
          <w:insideH w:val="none"/>
          <w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="4500"/>
        <w:gridCol w:w="4500"/>
      </w:tblGrid>`;

        // Organizar materias en 2 columnas
        const halfLength = Math.ceil(materias.length / 2);
        for (let i = 0; i < halfLength; i++) {
            const materia1 = materias[i] || null;
            const materia2 = materias[i + halfLength] || null;

            xml += `
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4500" w:type="dxa"/>
            <w:vAlign w:val="top"/>
          </w:tcPr>`;

            if (materia1) {
                xml += `
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:after="0"/>
              <w:ind w:left="200"/>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:b/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t>${this._escapeXml(materia1.sigla || '')}</w:t>
            </w:r>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                  <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t xml:space="preserve"> - ${this._escapeXml(materia1.nombre || '')}</w:t>
            </w:r>
          </w:p>`;
            } else {
                xml += `
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:after="0"/>
            </w:pPr>
          </w:p>`;
            }

            xml += `
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4500" w:type="dxa"/>
            <w:vAlign w:val="top"/>
          </w:tcPr>`;

            if (materia2) {
                xml += `
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:after="0"/>
              <w:ind w:left="200"/>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:b/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t>${this._escapeXml(materia2.sigla || '')}</w:t>
            </w:r>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
                <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t xml:space="preserve"> - ${this._escapeXml(materia2.nombre || '')}</w:t>
            </w:r>
          </w:p>`;
            } else {
                xml += `
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:after="0"/>
            </w:pPr>
          </w:p>`;
            }

            xml += `
        </w:tc>
      </w:tr>`;
        }

        xml += `
    </w:tbl>
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:before="100" w:after="100"/>
      </w:pPr>
    </w:p>`;

        return xml;
    }

    /**
     * Crea la tabla de Documentos (sin materias, solo lista simple)
     * @private
     */
    static _createDocumentsTable(documentos) {
        const documentosItems = [
            { label: 'Fotocopia Carnet de Identidad', checked: documentos.ci || false },
            { label: 'Fotocopia Certificado de Nacimiento', checked: documentos.certificadoNacimiento || false },
            { label: 'Fotocopia de Título de Bachiller', checked: documentos.diplomaBachiller || false },
            { label: 'Aporte Voluntario', checked: documentos.aporteVoluntario || false },
        ];

        let xml = '';
        documentosItems.forEach((item, index) => {
            const isLast = index === documentosItems.length - 1;
            xml += `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:after="${isLast ? '150' : '0'}"/>
        <w:ind w:left="200"/>
        <w:rPr>
          <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
          <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
          <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
          <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
          <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
        </w:rPr>
        <w:t xml:space="preserve">• ${this._escapeXml(item.label)}    ${item.checked ? '[X]' : '[  ]'}</w:t>
      </w:r>
    </w:p>`;
        });

        return xml;
    }

    /**
     * Crea la sección de firmas
     * @private
     */
    static _createSignaturesSection() {
        return `
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="none"/>
          <w:left w:val="none"/>
          <w:bottom w:val="none"/>
          <w:right w:val="none"/>
          <w:insideH w:val="none"/>
          <w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="4500"/>
        <w:gridCol w:w="4500"/>
      </w:tblGrid>
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4500" w:type="dxa"/>
          </w:tcPr>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:before="450" w:after="50"/>
              <w:jc w:val="center"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t>_____________________</w:t>
            </w:r>
          </w:p>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:jc w:val="center"/>
              <w:spacing w:after="0"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t>Firma Estudiante</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4500" w:type="dxa"/>
          </w:tcPr>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:before="500" w:after="50"/>
              <w:jc w:val="center"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t>_____________________</w:t>
            </w:r>
          </w:p>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:jc w:val="center"/>
              <w:spacing w:after="0"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
                <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
              </w:rPr>
              <w:t>Responsable Inscripción</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>`;
    }

    /**
     * Crea la nota legal
     * @private
     */
    static _createLegalNote() {
        return `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:before="300" w:after="200"/>
        <w:jc w:val="both"/>
        <w:rPr>
          <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
          <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
          <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="${this.DEFAULT_FONT}" w:hAnsi="${this.DEFAULT_FONT}"/>
          <w:sz w:val="${this.DEFAULT_FONT_SIZE}"/>
          <w:szCs w:val="${this.DEFAULT_FONT_SIZE}"/>
        </w:rPr>
        <w:t>El llenado del presente formulario es responsabilidad plena del postulante (estudiante) y los documentos adjuntos respaldan los requisitos establecidos por la R.M. 0001/2026</w:t>
      </w:r>
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
            .replace(/'/g, '&#x2019;');
    }

    /**
     * Genera un ID único para elementos XML
     * @private
     */
    static _generateId() {
        return Math.floor(Math.random() * 0x7FFFFFFF).toString(16).toUpperCase().padStart(8, '0');
    }
}
