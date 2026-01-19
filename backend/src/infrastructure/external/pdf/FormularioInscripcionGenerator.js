/**
 * FormularioInscripcionGenerator
 * 
 * Genera el formulario de inscripción siguiendo el diseño oficial del instituto
 * Basado en la imagen de referencia proporcionada
 */

import { IncosPDFBase } from './IncosPDFBase.js';

export class FormularioInscripcionGenerator extends IncosPDFBase {
  /**
   * Genera el formulario de inscripción
   * @param {Object} data - Datos del estudiante
   * @param {string} outputPath - Ruta de salida del PDF
   * @returns {Promise<string>} Ruta del archivo generado
   */
  static async generate(data, outputPath) {
    const generator = new FormularioInscripcionGenerator(outputPath);
    return await generator.build(data);
  }

  /**
   * Construye el documento completo
   * @param {Object} data - Datos del estudiante
   */
  async build(data) {
    // Encabezado institucional
    this.addInstitutionalHeader('FORMULARIO DE INSCRIPCIÓN', {
      gestion: data.gestionYear || new Date().getFullYear(),
      showDate: false,
    });

    // Sección 1: Datos Personales
    this.addSection('1. DATOS PERSONALES', () => {
      this.addDatosPersonales(data);
    });

    // Sección 2: Datos Académicos
    this.addSection('2. DATOS ACADÉMICOS', () => {
      this.addDatosAcademicos(data);
    });

    // Sección 3: Documentos Recepcionados
    this.addSection('3. DOCUMENTOS RECEPCIONADOS', () => {
      this.addDocumentosRecepcionados(data.documentos || {});
    });

    // Espacio antes de firmas
    this.addSpace(20);

    // Firmas
    this.addMultipleSignatures([
      {
        label: 'Firma Estudiante',
        name: '',
        ci: data.ci || '',
      },
      {
        label: 'Responsable Inscripción',
        name: '',
        ci: '',
      },
    ]);

    // Footer disclaimer
    this.addFooter(
      'El llenado del presente formulario es responsabilidad plena del postulante (estudiante) y los documentos ' +
      'adjuntos respaldan los requisitos establecidos por la R.M. 0001/2026',
      { fontSize: 8 }
    );

    // Guardar documento
    return await this.save();
  }

  /**
   * Agrega la sección de datos personales
   * @param {Object} data - Datos del estudiante
   */
  addDatosPersonales(data) {
    // Nombres y Apellidos - Sub-subsección
    this.addSubsection('Nombres y Apellidos:', () => {
      this.addField('Apellido Paterno', data.apellidoPaterno || '', { indent: 20, inline: false });
      this.addField('Apellido Materno', data.apellidoMaterno || '', { indent: 20, inline: false });
      this.addField('Nombres', data.nombres || '', { indent: 20, inline: false });
    });

    this.addSpace(5);

    // C.I. en formato destacado
    this.addField('C.I. Nº', `${data.ci || ''} ${data.expedicion || ''}`, { bold: true });

    // Género con radio buttons
    this.addCheckboxGroup([
      { label: 'Masculino', checked: data.genero === 'Masculino' || data.genero === 'M' },
      { label: 'Femenino', checked: data.genero === 'Femenino' || data.genero === 'F' },
    ], {
      label: 'Género',
      spacing: 120,
    });

    // Grupo Sanguíneo y Correo Electrónico
    this.addField('Grupo Sanguíneo', data.tipoSangre || '');
    this.addField('Correo Electrónico', data.emailPersonal || '');

    // Estado Civil con radio buttons
    this.addCheckboxGroup([
      { label: 'Soltero(a)', checked: data.estadoCivil?.toLowerCase().includes('solter') },
      { label: 'Casado(a)', checked: data.estadoCivil?.toLowerCase().includes('casad') },
      { label: 'Concubinato', checked: data.estadoCivil?.toLowerCase().includes('concubinat') },
    ], {
      label: 'Estado Civil',
      spacing: 120,
    });

    // Discapacidad con radio buttons
    this.addCheckboxGroup([
      { label: 'Sí', checked: data.tieneDiscapacidad === true },
      { label: 'No', checked: data.tieneDiscapacidad === false },
    ], {
      label: 'Discapacidad',
      spacing: 80,
    });

    this.addSpace(10);

    // Lugar y Fecha de Nacimiento - Sub-subsección
    this.addSubsection('Lugar y Fecha de Nacimiento:', () => {
      this.addField('Localidad', data.ciudadNacimiento || '', { indent: 20 });
      this.addField('Provincia', data.provincia || '', { indent: 20 });
      this.addField('Departamento', data.departamento || '', { indent: 20 });

      // Fecha de nacimiento (Día, Mes, Año)
      const fechaParts = data.fechaNacimiento ? data.fechaNacimiento.split('/') : ['', '', ''];
      this.addFieldsInColumns([
        { label: 'Día', value: fechaParts[0] || '' },
        { label: 'Mes', value: fechaParts[1] || '' },
      ]);
      this.addField('Año', fechaParts[2] || '', { indent: 20 });

      this.addField('Nacionalidad', data.nacionalidad || 'Boliviana', { indent: 20 });
      this.addField('Edad', data.edad || '', { indent: 20 });
    });

    // Domicilio, Idioma y Celular
    this.addField('Domicilio', data.direccion || '');
    this.addField('Idioma de origen', data.idiomaMaterno || '');
    this.addField('Celular', data.celular || '');

    // Datos laborales (solo si trabaja)
    if (data.trabaja) {
      this.addSpace(5);
      this.addCheckboxGroup([
        { label: 'Sí', checked: true },
        { label: 'No', checked: false },
      ], {
        label: 'Trabaja',
        spacing: 80,
      });

      if (data.cargo) {
        this.addField('Cargo', data.cargo);
      }
      if (data.empresa) {
        this.addField('Empresa/Institución', data.empresa);
      }
    }
  }

  /**
   * Agrega la sección de datos académicos
   * @param {Object} data - Datos del estudiante
   */
  addDatosAcademicos(data) {
    // Carrera con radio buttons
    this.addText('Carrera:', { bold: true });
    this.addSpace(5);

    const carreras = [
      'Sistemas Informáticos',
      'Administración de Empresas',
      'Contaduría General',
    ];

    const carreraActual = data.carrera || '';
    carreras.forEach((carrera) => {
      const checked = carreraActual.toLowerCase().includes(carrera.toLowerCase().split(' ')[0].toLowerCase());
      this.addCheckbox(carrera, checked, { x: this.options.margins.left + 40 });
    });

    this.addSpace(10);

    // Año con radio buttons
    this.addCheckboxGroup([
      { label: 'Primer Año', checked: data.anio?.toLowerCase().includes('primer') },
      { label: 'Segundo Año', checked: data.anio?.toLowerCase().includes('segund') },
      { label: 'Tercer Año', checked: data.anio?.toLowerCase().includes('tercer') },
    ], {
      label: 'Año',
      spacing: 140,
    });
  }

  /**
   * Agrega la sección de documentos recepcionados
   * @param {Object} documentos - Estado de documentos
   */
  addDocumentosRecepcionados(documentos) {
    const items = [
      { label: 'Fotocopia Carnet de Identidad', checked: documentos.ci || false },
      { label: 'Fotocopia Certificado de Nacimiento', checked: documentos.certificadoNacimiento || false },
      { label: 'Fotocopia de Título de Bachiller', checked: documentos.diplomaBachiller || false },
      { label: 'Aporte Voluntario', checked: documentos.aporteVoluntario || false },
    ];

    this.addChecklist(items);
  }
}
