/**
 * BoletaInscripcionWordGenerator - VERSIÓN CORREGIDA
 * 
 * Genera la BOLETA DE INSCRIPCIÓN para:
 * INSTITUTO TÉCNICO SUPERIOR DE EDUCACIÓN COMERCIAL "ISEC MONTERO"
 * 
 * Este generador coincide EXACTAMENTE con el formato del formulario físico usado por el instituto.
 * 
 * Estructura (basada en la imagen de referencia):
 * ┌─────────────────────────────────────────────────────────────┐
 * │ INSTITUTO TÉCNICO SUPERIOR DE EDUCACIÓN COMERCIAL          │
 * │ "ISEC MONTERO"                                             │
 * │ FORMULARIO DE INSCRIPCIÓN                                   │
 * │ GESTIÓN 2026                                                │
 * ├─────────────────────────────────────────────────────────────┤
 * │ 1.- DATOS PERSONALES                                        │
 * │   Nombres y Apellidos:                                      │
 * │   [Apellido Paterno] [Apellido Materno] [Nombres]          │
 * │                                                             │
 * │   C.I. Nº [____] [__]  Género: Masculino O Femenino O      │
 * │   Grupo Sanguíneo: [____]                                   │
 * │   Correo Electrónico: [_____________________]              │
 * │   Estado Civil: Soltero(a) O Casado(a) O Concubinato O    │
 * │                 Discapacidad: Si) O No) O                  │
 * │                                                             │
 * │   Lugar y Fecha de Nacimiento                               │
 * │   [Localidad] [Provincia] [Departamento]                   │
 * │   Día [__] - Mes [__] Año [____]  Nacionalidad [____]     │
 * │   Edad [__]                                                 │
 * │   Domicilio: [____________________]                        │
 * │   Idioma de origen [____]  Celular [______]                │
 * │                                                             │
 * │   Trabaja: Si) O No) O  Cargo: [____]                      │
 * │   Empresa/Institución: [______________]                    │
 * ├─────────────────────────────────────────────────────────────┤
 * │ 2.- DATOS ACADÉMICOS                                        │
 * │   Carrera:              Año:                                │
 * │   Contaduría General  O    Primer Año    O                 │
 * │   Secretariado Ejecutivo O  Segundo Año   O                │
 * │   Sistemas Informáticos  O  Tercer Año   O                 │
 * │   Mercadotecnia         O                                  │
 * ├─────────────────────────────────────────────────────────────┤
 * │ 3.- DOCUMENTOS RECEPCIONADOS                                │
 * │   • Fotocopia Carnet de Identidad           O              │
 * │   • Fotocopia Certificado de Nacimiento     O              │
 * │   • Fotocopia de Título de Bachiller        O              │
 * │   • Aporte Voluntario                       O              │
 * ├─────────────────────────────────────────────────────────────┤
 * │              ___________________                            │
 * │              Firma Estudiante                               │
 * │                                                             │
 * │                              ___________________           │
 * │                              Responsable Inscripción       │
 * │                                                             │
 * │ El llenado del presente formulario es responsabilidad      │
 * │ plena del postulante (estudiante) y los documentos         │
 * │ adjuntos respaldan los requisitos establecidos por la      │
 * │ R.M. 0001/2026                                              │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * @module BoletaInscripcionWordGenerator
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PizZip from 'pizzip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BoletaInscripcionWordGenerator {
  static TEMPLATE_PATH = path.join(__dirname, '../templates/Plantilla.docx');

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
   * COINCIDIENDO EXACTAMENTE con la plantilla física
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
    contenido += this._createSection('1.- DATOS PERSONALES');

    // Subsección: Nombres y Apellidos
    contenido += this._createSubsection('Nombres y Apellidos:');
    
    // Campos de nombres en una sola línea con separadores visuales
    contenido += this._createFieldRow([
      { label: 'Apellido Paterno', value: apellidoPaterno },
      { label: 'Apellido Materno', value: apellidoMaterno },
      { label: 'Nombres', value: nombres },
    ]);

    contenido += this._createSpacing(200);

    // C.I. y Género en la misma línea
    contenido += this._createFieldWithInlineCheckboxes(
      `C.I. Nº ${ci || '________'} ${expedicion || '____'}`,
      'Género:',
      [
        { label: 'Masculino', checked: genero === 'Masculino' || genero === 'M' },
        { label: 'Femenino', checked: genero === 'Femenino' || genero === 'F' },
      ]
    );

    // Grupo Sanguíneo
    contenido += this._createField('Grupo Sanguíneo', tipoSangre);

    // Correo Electrónico
    contenido += this._createField('Correo Electrónico', emailPersonal);

    contenido += this._createSpacing(100);

    // Estado Civil con checkboxes en línea horizontal
    const esEstadoCivilSoltero = estadoCivil?.toLowerCase().includes('solter');
    const esEstadoCivilCasado = estadoCivil?.toLowerCase().includes('casad');
    const esEstadoCivilConcubinato = estadoCivil?.toLowerCase().includes('concubinat');

    contenido += this._createFieldWithInlineCheckboxes(
      'Estado Civil:',
      null,
      [
        { label: 'Soltero(a)', checked: esEstadoCivilSoltero },
        { label: 'Casado(a)', checked: esEstadoCivilCasado },
        { label: 'Concubinato', checked: esEstadoCivilConcubinato },
      ],
      { rightLabel: 'Discapacidad:', rightOptions: [
        { label: 'Si)', checked: tieneDiscapacidad === true },
        { label: 'No)', checked: tieneDiscapacidad === false },
      ]}
    );

    contenido += this._createSpacing(200);

    // Subsección: Lugar y Fecha de Nacimiento
    contenido += this._createSubsection('Lugar y Fecha de Nacimiento');
    
    // Localidad, Provincia, Departamento en una fila
    contenido += this._createFieldRow([
      { label: '', value: ciudadNacimiento, placeholder: 'Localidad' },
      { label: '', value: provincia, placeholder: 'Provincia' },
      { label: '', value: departamento, placeholder: 'Departamento' },
    ]);

    // Día, Mes, Año, Nacionalidad, Edad
    contenido += this._createMultiFieldLine([
      { label: 'Día', value: dia },
      { label: '-', value: '' },
      { label: 'Mes', value: mes },
      { label: 'Año', value: año },
      { label: 'Nacionalidad', value: nacionalidad },
      { label: 'Edad', value: edad },
    ]);

    // Domicilio
    contenido += this._createField('Domicilio', direccion);

    // Idioma de origen y Celular en la misma línea
    contenido += this._createFieldsInLine([
      { label: 'Idioma de origen', value: idiomaMaterno },
      { label: 'Celular', value: celular },
    ]);

    contenido += this._createSpacing(200);

    // Trabaja: Si/No, Cargo, Empresa
    contenido += this._createFieldWithInlineCheckboxes(
      'Trabaja:',
      null,
      [
        { label: 'Si)', checked: trabaja === true },
        { label: 'No)', checked: trabaja === false },
      ]
    );

    if (trabaja) {
      contenido += this._createField('Cargo', cargo);
      contenido += this._createField('Empresa/Institución', empresa);
    }

    contenido += this._createSpacing(300);

    // ============================================
    // SECCIÓN 2: DATOS ACADÉMICOS
    // ============================================
    contenido += this._createSection('2.- DATOS ACADÉMICOS');

    // Carrera y Año en dos columnas
    contenido += this._createTwoColumnSection(
      // Columna izquierda: Carrera
      () => {
        let col1 = this._createParagraph('Carrera:', { bold: true, fontSize: 20 });
        col1 += this._createCheckboxItem('Contaduría General', carrera?.toLowerCase().includes('contad'));
        col1 += this._createCheckboxItem('Secretariado Ejecutivo', carrera?.toLowerCase().includes('secretariad'));
        col1 += this._createCheckboxItem('Sistemas Informáticos', carrera?.toLowerCase().includes('sistem') || carrera?.toLowerCase().includes('informát'));
        col1 += this._createCheckboxItem('Mercadotecnia', carrera?.toLowerCase().includes('mercadotecnia'));
        return col1;
      },
      // Columna derecha: Año
      () => {
        let col2 = this._createParagraph('Año:', { bold: true, fontSize: 20 });
        col2 += this._createCheckboxItem('Primer Año', anio?.toLowerCase().includes('primer'));
        col2 += this._createCheckboxItem('Segundo Año', anio?.toLowerCase().includes('segund'));
        col2 += this._createCheckboxItem('Tercer Año', anio?.toLowerCase().includes('tercer'));
        return col2;
      }
    );

    contenido += this._createSpacing(300);

    // ============================================
    // SECCIÓN 3: DOCUMENTOS RECEPCIONADOS
    // ============================================
    contenido += this._createSection('3.- DOCUMENTOS RECEPCIONADOS');

    const documentosItems = [
      { label: 'Fotocopia Carnet de Identidad', checked: documentos.ci || false },
      { label: 'Fotocopia Certificado de Nacimiento', checked: documentos.certificadoNacimiento || false },
      { label: 'Fotocopia de Título de Bachiller', checked: documentos.diplomaBachiller || false },
      { label: 'Aporte Voluntario', checked: documentos.aporteVoluntario || false },
    ];

    documentosItems.forEach((item) => {
      contenido += this._createBulletCheckboxItem(item.label, item.checked);
    });

    contenido += this._createSpacing(400);

    // ============================================
    // FIRMAS
    // ============================================
    contenido += this._createTwoColumnSignatures(
      { label: 'Firma Estudiante', ci: '', expedicion: '' },
      { label: 'Responsable Inscripción', ci: '', expedicion: '' }
    );

    contenido += this._createSpacing(300);

    // ============================================
    // NOTA LEGAL
    // ============================================
    contenido += this._createParagraph(
      'El llenado del presente formulario es responsabilidad plena del postulante (estudiante) y los documentos ' +
      'adjuntos respaldan los requisitos establecidos por la R.M. 0001/2026',
      { fontSize: 16, align: 'justify' }
    );

    return contenido;
  }

  // ============================================
  // MÉTODOS AUXILIARES PARA GENERAR XML
  // ============================================

  /**
   * Crea una sección con título principal
   * @private
   */
  static _createSection(title) {
    return `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:before="300" w:after="150"/>
        <w:jc w:val="left"/>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:b/>
          <w:sz w:val="22"/>
          <w:szCs w:val="22"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:b/>
          <w:sz w:val="22"/>
          <w:szCs w:val="22"/>
        </w:rPr>
        <w:t>${this._escapeXml(title)}</w:t>
      </w:r>
    </w:p>`;
  }

  /**
   * Crea una subsección con título
   * @private
   */
  static _createSubsection(title) {
    return `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:before="150" w:after="100"/>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:b/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:b/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>${this._escapeXml(title)}</w:t>
      </w:r>
    </w:p>`;
  }

  /**
   * Crea una fila de campos (como Apellido Paterno | Apellido Materno | Nombres)
   * @private
   */
  static _createFieldRow(fields) {
    let xml = `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:after="100"/>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
      </w:pPr>`;

    fields.forEach((field, index) => {
      if (index > 0) {
        xml += `
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t xml:space="preserve"> | </w:t>
      </w:r>`;
      }

      const displayValue = field.value || field.placeholder || '_'.repeat(20);
      
      xml += `
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>${this._escapeXml(displayValue)}</w:t>
      </w:r>`;
    });

    xml += `
    </w:p>`;

    return xml;
  }

  /**
   * Crea un campo con label y valor
   * @private
   */
  static _createField(label, value, options = {}) {
    const { indent = 0, bold = false } = options;
    const displayValue = value || '_'.repeat(20);
    
    return `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:after="100"/>
        ${indent > 0 ? `<w:ind w:left="${indent}"/>` : ''}
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          ${bold ? '<w:b/>' : ''}
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          ${bold ? '<w:b/>' : ''}
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>${this._escapeXml(label)}: ${this._escapeXml(displayValue)}</w:t>
      </w:r>
    </w:p>`;
  }

  /**
   * Crea un campo con checkboxes en línea
   * Ejemplo: "C.I. Nº 12345678 S.C.    Género: ☒ Masculino ☐ Femenino"
   * @private
   */
  static _createFieldWithInlineCheckboxes(leftText, checkboxLabel, checkboxes, options = {}) {
    const { rightLabel = null, rightOptions = null } = options;
    
    let xml = `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:after="100"/>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
      </w:pPr>`;

    // Texto izquierdo
    xml += `
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t xml:space="preserve">${this._escapeXml(leftText)}</w:t>
      </w:r>`;

    // Espaciado
    xml += `
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t xml:space="preserve">    </w:t>
      </w:r>`;

    // Label de checkboxes (si existe)
    if (checkboxLabel) {
      xml += `
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>${this._escapeXml(checkboxLabel)}</w:t>
      </w:r>`;
    }

    // Checkboxes
    checkboxes.forEach((checkbox) => {
      const checkSymbol = checkbox.checked ? '☒' : '☐';
      xml += `
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t xml:space="preserve"> ${checkSymbol} ${this._escapeXml(checkbox.label)}</w:t>
      </w:r>`;
    });

    // Opciones a la derecha (si existen)
    if (rightLabel && rightOptions) {
      xml += `
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t xml:space="preserve">    ${this._escapeXml(rightLabel)}</w:t>
      </w:r>`;

      rightOptions.forEach((opt) => {
        const checkSymbol = opt.checked ? '☒' : '☐';
        xml += `
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t xml:space="preserve"> ${checkSymbol} ${this._escapeXml(opt.label)}</w:t>
      </w:r>`;
      });
    }

    xml += `
    </w:p>`;

    return xml;
  }

  /**
   * Crea múltiples campos en una línea (como Día - Mes Año Nacionalidad Edad)
   * @private
   */
  static _createMultiFieldLine(fields) {
    let xml = `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:after="100"/>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
      </w:pPr>`;

    fields.forEach((field, index) => {
      if (index > 0) {
        xml += `
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t xml:space="preserve"> </w:t>
      </w:r>`;
      }

      const text = field.label ? `${field.label} ${field.value || '____'}` : field.value || '____';
      
      xml += `
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>${this._escapeXml(text)}</w:t>
      </w:r>`;
    });

    xml += `
    </w:p>`;

    return xml;
  }

  /**
   * Crea campos en línea (como "Idioma de origen: [___]  Celular: [___]")
   * @private
   */
  static _createFieldsInLine(fields) {
    let xml = `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:after="100"/>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
      </w:pPr>`;

    fields.forEach((field, index) => {
      if (index > 0) {
        xml += `
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t xml:space="preserve">  </w:t>
      </w:r>`;
      }

      const displayValue = field.value || '_'.repeat(15);
      
      xml += `
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>${this._escapeXml(field.label)}: ${this._escapeXml(displayValue)}</w:t>
      </w:r>`;
    });

    xml += `
    </w:p>`;

    return xml;
  }

  /**
   * Crea un checkbox simple (sin bullet)
   * @private
   */
  static _createCheckboxItem(label, checked) {
    const checkSymbol = checked ? '☒' : '☐';
    
    return `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:after="80"/>
        <w:ind w:left="400"/>
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
        <w:t xml:space="preserve">${checkSymbol} ${this._escapeXml(label)}</w:t>
      </w:r>
    </w:p>`;
  }

  /**
   * Crea un checkbox con bullet (para documentos)
   * @private
   */
  static _createBulletCheckboxItem(label, checked) {
    const checkSymbol = checked ? '☒' : '☐';
    
    return `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:after="100"/>
        <w:ind w:left="400"/>
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
        <w:t xml:space="preserve">• ${this._escapeXml(label)}    ${checkSymbol}</w:t>
      </w:r>
    </w:p>`;
  }

  /**
   * Crea una sección de dos columnas
   * @private
   */
  static _createTwoColumnSection(leftColumnFn, rightColumnFn) {
    // Por simplicidad, generamos las columnas secuencialmente
    // En un sistema más avanzado, usaríamos tablas de Word
    let xml = '';
    
    xml += leftColumnFn();
    xml += this._createSpacing(100);
    xml += rightColumnFn();
    
    return xml;
  }

  /**
   * Crea dos columnas de firmas
   * @private
   */
  static _createTwoColumnSignatures(leftSig, rightSig) {
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
      </w:tblGrid>
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4500" w:type="dxa"/>
          </w:tcPr>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:before="400" w:after="100"/>
              <w:jc w:val="center"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
                <w:sz w:val="20"/>
              </w:rPr>
              <w:t>_____________________</w:t>
            </w:r>
          </w:p>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:jc w:val="center"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
                <w:sz w:val="20"/>
              </w:rPr>
              <w:t>${this._escapeXml(leftSig.label)}</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4500" w:type="dxa"/>
          </w:tcPr>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:spacing w:before="400" w:after="100"/>
              <w:jc w:val="center"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
                <w:sz w:val="20"/>
              </w:rPr>
              <w:t>_____________________</w:t>
            </w:r>
          </w:p>
          <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}">
            <w:pPr>
              <w:jc w:val="center"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
                <w:sz w:val="20"/>
              </w:rPr>
              <w:t>${this._escapeXml(rightSig.label)}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>`;

    return xml;
  }

  /**
   * Crea un párrafo de texto
   * @private
   */
  static _createParagraph(text, options = {}) {
    const {
      bold = false,
      fontSize = 20,
      align = 'left',
    } = options;

    return `
    <w:p w14:paraId="${this._generateId()}" w14:textId="${this._generateId()}" w:rsidR="00DD08A8" w:rsidRDefault="00DD08A8">
      <w:pPr>
        <w:spacing w:after="100"/>
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
   * Crea espacio vertical
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
