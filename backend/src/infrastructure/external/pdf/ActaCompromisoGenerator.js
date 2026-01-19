/**
 * ActaCompromisoGenerator
 * 
 * Genera el acta de compromiso para entrega de documentos
 * Basado en la imagen de referencia proporcionada
 */

import { IncosPDFBase } from './IncosPDFBase.js';

export class ActaCompromisoGenerator extends IncosPDFBase {
  /**
   * Genera el acta de compromiso
   * @param {Object} data - Datos del estudiante y compromiso
   * @param {string} outputPath - Ruta de salida del PDF
   * @returns {Promise<string>} Ruta del archivo generado
   */
  static async generate(data, outputPath) {
    const generator = new ActaCompromisoGenerator(outputPath);
    return await generator.build(data);
  }

  /**
   * Construye el documento completo
   * @param {Object} data - Datos del acta
   */
  async build(data) {
    // Encabezado institucional
    this.addInstitutionalHeader('ACTA DE COMPROMISO PARA LA ENTREGA DE DOCUMENTOS', {
      showDate: false,
      showMotto: true,
    });

    // Sección I: Fecha de Registro
    this.addSection('I. FECHA DE REGISTRO', () => {
      this.addFechaRegistro(data);
    });

    // Sección II: Nombre Completo y Número de Identificación
    this.addSection('II. NOMBRE COMPLETO Y NUMERO DE IDENTIFICACION', () => {
      this.addIdentificacion(data);
    });

    // Sección III: Año y Carrera (solo si hay datos académicos)
    if (data.carrera || data.anioCarrera || data.paralelo) {
      this.addSection('III. AÑO Y CARRERA A LA QUE POSTULA', () => {
        this.addDatosAcademicos(data);
      });
    }

    // Sección de Requisitos (número varía según si hay datos académicos)
    const seccionRequisitos = (data.carrera || data.anioCarrera || data.paralelo) ? 'IV' : 'III';
    this.addSection(`${seccionRequisitos}. REQUISITOS`, () => {
      this.addRequisitos(data);
    });

    // Compromiso
    this.addCompromiso(data);

    // Motivos
    this.addMotivos(data);

    // Declaración final
    this.addDeclaracionFinal();

    // Espacio antes de firma
    this.addSpace(30);

    // Firma
    this.addSignature({
      label: 'Firma',
      name: '',
      ci: `${data.ci || ''} ${data.expedicion || 'S.C.'}`,
      x: this.options.margins.left + 50,
      width: 200,
    });

    // Guardar documento
    return await this.save();
  }

  /**
   * Agrega la fecha de registro
   * @param {Object} data - Datos del acta
   */
  addFechaRegistro(data) {
    const fecha = data.fecha || new Date();
    const ciudad = data.ciudad || IncosPDFBase.INSTITUTE.city;

    this.addText(this.formatFullDate(fecha, ciudad), {
      indent: 20,
    });
  }

  /**
   * Agrega la identificación del estudiante
   * @param {Object} data - Datos del acta
   */
  addIdentificacion(data) {
    this.addText(`Yo ${data.nombreCompleto || ''}`, { indent: 20 });
    this.addText(`con C.I. Nº ${data.ci || ''} ${data.expedicion || 'S.C.'}`, { indent: 20 });
  }

  /**
   * Agrega los datos académicos (si existen)
   * @param {Object} data - Datos del acta
   */
  addDatosAcademicos(data) {
    if (data.anioCarrera) {
      this.addText(`Del ${data.anioCarrera} Año`, { indent: 20 });
    }
    if (data.paralelo) {
      this.addText(`Paralelo: ${data.paralelo}`, { indent: 20 });
    }
    if (data.carrera) {
      this.addText(`Carrera: ${data.carrera}`, { indent: 20 });
    }
  }

  /**
   * Agrega la lista de requisitos con checkboxes
   * @param {Object} data - Datos del acta
   */
  addRequisitos(data) {
    // Instrucciones
    this.addText(
      'Marcar con una "X" en el recuadro los requisitos que ya fueron presentados.',
      { bold: true, fontSize: 11 }
    );
    this.addSpace(10);

    // Determinar documentos requeridos
    const requisitos = data.documentosRequeridos && data.documentosRequeridos.length > 0
      ? data.documentosRequeridos
      : [
          'Diploma de Bachiller',
          'Certificado de Nacimiento',
          'Carnet de Identidad',
          'Foto 3x3 fondo rojo',
          'Folder con nepaco',
        ];

    // Obtener índices de documentos ENTREGADOS (se marcan con X)
    const documentosEntregados = data.documentosEntregados || [];

    // Crear items para el checklist
    const items = requisitos.map((nombre, index) => ({
      label: nombre,
      checked: documentosEntregados.includes(index),
    }));

    this.addChecklist(items);
  }

  /**
   * Agrega el texto de compromiso
   * @param {Object} data - Datos del acta
   */
  addCompromiso(data) {
    this.addSpace(10);

    this.addText('Me comprometo completar la documentación Faltante.', {
      indent: 20,
    });

    const plazoMaximo = data.plazoMaximo || 10;
    this.addText(
      `En un plazo máximo de ${plazoMaximo} días, a partir de la fecha de registro.`,
      { indent: 20 }
    );

    this.addSpace(10);
  }

  /**
   * Agrega el área de motivos
   * @param {Object} data - Datos del acta
   */
  addMotivos(data) {
    this.addText(
      'Mencione los motivos por lo que no ha presentado los mencionados documentos:',
      { indent: 20 }
    );

    this.addSpace(5);

    // Cuadro de texto con motivos
    const motivos = data.motivos || 'Actualización de carta aval del presente año.';
    this.addTextBox(motivos, {
      height: 60,
    });
  }

  /**
   * Agrega la declaración final
   */
  addDeclaracionFinal() {
    this.addText(
      'Una vez vencido el plazo y en caso de no haber completado los requisitos exigidos por el ' +
      'Instituto Técnico INCOS SANTA CRUZ; me sujeto a las disposiciones de las Autoridades del Instituto.',
      {
        fontSize: 10,
        indent: 20,
      }
    );
  }
}
