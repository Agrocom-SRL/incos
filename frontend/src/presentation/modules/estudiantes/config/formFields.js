// modules/estudiantes/config/formFields.js
/**
 * Configuración de campos del formulario de estudiantes
 * 
 * Solo incluye campos propios de la tabla estudiantes (sin foreign keys)
 * Fase 1: Registro básico y limpio
 */

import dayjs from 'dayjs';

export const studentFormFields = {
  // Sección: Datos Personales Básicos
  personalData: {
    title: 'Datos Personales Básicos',
    fields: [
      {
        name: 'ci',
        label: 'CI',
        type: 'input',
        rules: [
          { required: true, message: 'El CI es requerido' },
          { pattern: /^\d{7,9}$/, message: 'El CI debe tener entre 7 y 9 dígitos' },
        ],
        placeholder: 'Ej: 12345678',
        maxLength: 9,
        span: 8,
      },
      {
        name: 'expedicion',
        label: 'Expedición',
        type: 'select',
        rules: [
          { required: true, message: 'La expedición es requerida' },
        ],
        options: 'expediciones', // Referencia a datos del Provider
        placeholder: 'Seleccione la expedición',
        span: 8,
      },
      {
        name: 'fechaNacimiento',
        label: 'Fecha de Nacimiento',
        type: 'datePicker',
        rules: [
          { required: true, message: 'La fecha de nacimiento es requerida' },
        ],
        format: 'YYYY-MM-DD',
        disabledDate: (current) => {
          // No permitir fechas futuras y validar edad mínima (17 años)
          if (current && current > dayjs().endOf('day')) {
            return true;
          }
          // Validar que tenga al menos 17 años
          const minDate = dayjs().subtract(17, 'year');
          return current && current > minDate;
        },
        placeholder: 'Seleccione la fecha de nacimiento',
        span: 8,
      },
      {
        name: 'nombres',
        label: 'Nombres',
        type: 'input',
        rules: [
          { required: true, message: 'Los nombres son requeridos' },
          { min: 2, message: 'Los nombres deben tener al menos 2 caracteres' },
          { max: 150, message: 'Los nombres no pueden exceder 150 caracteres' },
        ],
        placeholder: 'Ingrese los nombres',
        span: 8,
      },
      {
        name: 'apellidoPaterno',
        label: 'Apellido Paterno',
        type: 'input',
        rules: [
          { required: true, message: 'El apellido paterno es requerido' },
          { min: 2, message: 'El apellido paterno debe tener al menos 2 caracteres' },
          { max: 100, message: 'El apellido paterno no puede exceder 100 caracteres' },
        ],
        placeholder: 'Ingrese el apellido paterno',
        span: 8,
      },
      {
        name: 'apellidoMaterno',
        label: 'Apellido Materno',
        type: 'input',
        rules: [
          { max: 100, message: 'El apellido materno no puede exceder 100 caracteres' },
        ],
        placeholder: 'Ingrese el apellido materno',
        span: 8,
      },
      {
        name: 'genero',
        label: 'Género',
        type: 'select',
        rules: [
          { required: true, message: 'El género es requerido' },
        ],
        options: 'generos', // Referencia a datos del Provider
        placeholder: 'Seleccione el género',
        span: 8,
      },
      {
        name: 'tipoSangre',
        label: 'Tipo de Sangre',
        type: 'select',
        options: 'tiposSangre', // Referencia a datos del Provider
        placeholder: 'Seleccione el tipo de sangre',
        allowClear: true,
        span: 8,
      },
      {
        name: 'tieneDiscapacidad',
        label: '¿Tiene Discapacidad?',
        type: 'switch',
        span: 8,
      },
      {
        name: 'tipoDiscapacidadId',
        label: 'Tipo de Discapacidad',
        type: 'select',
        options: 'tiposDiscapacidad',
        placeholder: 'Seleccione el tipo de discapacidad',
        allowClear: true,
        span: 8,
        dependencies: ['tieneDiscapacidad'],
        watchFields: ['tieneDiscapacidad'], // Campos a observar para shouldRender
        shouldRender: (formValues) => formValues?.tieneDiscapacidad === true,
      },
    ],
  },

  // Sección: Datos Geográficos y Origen
  geographicData: {
    title: 'Origen y Ubicación Geográfica',
    fields: [
      {
        name: 'nacionalidad',
        label: 'Nacionalidad',
        type: 'input',
        placeholder: 'Ej: Boliviana',
        span: 8,
      },
      {
        name: 'idiomaNatalId',
        label: 'Idioma Natal',
        type: 'select',
        options: 'idiomas',
        placeholder: 'Seleccione el idioma natal',
        allowClear: true,
        span: 8,
      },
      {
        name: 'paisNacimientoId',
        label: 'País de Nacimiento',
        type: 'select',
        options: 'paises',
        placeholder: 'Seleccione el país de nacimiento',
        allowClear: true,
        span: 8,
      },
      {
        name: 'departamentoNacimientoId',
        label: 'Departamento de Nacimiento',
        type: 'select',
        options: 'departamentos',
        placeholder: 'Seleccione el departamento de nacimiento',
        allowClear: true,
        span: 8,
        dependencies: ['paisNacimientoId'],
      },
      {
        name: 'provinciaNacimientoId',
        label: 'Provincia de Nacimiento',
        type: 'select',
        options: 'provincias',
        placeholder: 'Seleccione la provincia de nacimiento',
        allowClear: true,
        span: 8,
        dependencies: ['departamentoNacimientoId'],
      },
      {
        name: 'municipioNacimientoId',
        label: 'Municipio de Nacimiento',
        type: 'select',
        options: 'municipios',
        placeholder: 'Seleccione el municipio de nacimiento',
        allowClear: true,
        span: 8,
        dependencies: ['provinciaNacimientoId'],
      },
      {
        name: 'ciudadNacimiento',
        label: 'Ciudad de Nacimiento',
        type: 'input',
        rules: [
          { max: 100, message: 'La ciudad no puede exceder 100 caracteres' },
        ],
        placeholder: 'Ingrese la ciudad de nacimiento',
        span: 8,
      },
    ],
  },

  // Sección: Datos de Contacto
  contactData: {
    title: 'Datos de Contacto',
    fields: [
      {
        name: 'emailPersonal',
        label: 'Email Personal',
        type: 'input',
        inputType: 'email',
        rules: [
          { type: 'email', message: 'El email debe tener un formato válido' },
        ],
        placeholder: 'ejemplo@correo.com',
        span: 8,
      },
      {
        name: 'celular',
        label: 'Celular',
        type: 'input',
        rules: [
          { required: true, message: 'El celular es requerido' },
          { pattern: /^\d{7,8}$/, message: 'El celular debe tener entre 7 y 8 dígitos' },
        ],
        placeholder: 'Ej: 72345678',
        maxLength: 8,
        span: 8,
      },
      {
        name: 'telefonoFijo',
        label: 'Teléfono Fijo',
        type: 'input',
        rules: [
          { pattern: /^\d{7,8}$/, message: 'El teléfono fijo debe tener entre 7 y 8 dígitos' },
        ],
        placeholder: 'Ej: 4234567',
        maxLength: 8,
        span: 8,
      },
      {
        name: 'direccion',
        label: 'Dirección',
        type: 'textarea',
        placeholder: 'Ingrese la dirección completa',
        rows: 2,
        span: 24,
      },
      {
        name: 'paisResidenciaId',
        label: 'País de Residencia',
        type: 'select',
        options: 'paises',
        placeholder: 'Seleccione el país de residencia',
        allowClear: true,
        span: 8,
      },
      {
        name: 'departamentoResidenciaId',
        label: 'Departamento de Residencia',
        type: 'select',
        options: 'departamentos',
        placeholder: 'Seleccione el departamento de residencia',
        allowClear: true,
        span: 8,
        dependencies: ['paisResidenciaId'],
      },
      {
        name: 'provinciaResidenciaId',
        label: 'Provincia de Residencia',
        type: 'select',
        options: 'provincias',
        placeholder: 'Seleccione la provincia de residencia',
        allowClear: true,
        span: 8,
        dependencies: ['departamentoResidenciaId'],
      },
      {
        name: 'municipioResidenciaId',
        label: 'Municipio de Residencia',
        type: 'select',
        options: 'municipios',
        placeholder: 'Seleccione el municipio de residencia',
        allowClear: true,
        span: 8,
        dependencies: ['provinciaResidenciaId'],
      },
      {
        name: 'zona',
        label: 'Zona',
        type: 'input',
        rules: [
          { max: 100, message: 'La zona no puede exceder 100 caracteres' },
        ],
        placeholder: 'Ingrese la zona/barrio',
        span: 8,
      },
    ],
  },

  // Sección: Datos Académicos
  academicData: {
    title: 'Datos Académicos',
    fields: [
      {
        name: 'carreraId',
        label: 'Carrera',
        type: 'select',
        options: 'carreras',
        rules: [
          { required: true, message: 'La carrera es requerida' },
        ],
        placeholder: 'Seleccione la carrera',
        span: 8,
      },
      {
        name: 'gestionIngresoId',
        label: 'Gestión de Ingreso',
        type: 'select',
        options: 'gestiones',
        rules: [
          { required: true, message: 'La gestión de ingreso es requerida' },
        ],
        placeholder: 'Seleccione la gestión de ingreso',
        span: 8,
      },
      {
        name: 'unidadEducativaProcedencia',
        label: 'Unidad Educativa de Procedencia',
        type: 'input',
        rules: [
          { max: 200, message: 'No puede exceder 200 caracteres' },
        ],
        placeholder: 'Nombre del colegio o unidad educativa',
        span: 8,
      },
      {
        name: 'anioEgresoSecundaria',
        label: 'Año de Egreso de Secundaria',
        type: 'inputNumber',
        rules: [
          {
            validator: (_, value) => {
              if (value === null || value === undefined || value === '') {
                return Promise.resolve(); // Permitir valores vacíos (campo opcional)
              }
              const currentYear = new Date().getFullYear();
              const numValue = typeof value === 'number' ? value : Number(value);
              if (isNaN(numValue) || numValue < 1950 || numValue > currentYear) {
                return Promise.reject(new Error(`Año inválido. Debe estar entre 1950 y ${currentYear}`));
              }
              return Promise.resolve();
            },
          },
        ],
        placeholder: 'Ej: 2023',
        min: 1950,
        max: new Date().getFullYear(),
        span: 8,
      },
      {
        name: 'promedioAnual',
        label: 'Promedio Anual',
        type: 'inputNumber',
        rules: [
          {
            validator: (_, value) => {
              if (value === null || value === undefined || value === '') {
                return Promise.resolve(); // Permitir valores vacíos (campo opcional)
              }
              const numValue = typeof value === 'number' ? value : Number(value);
              if (isNaN(numValue) || numValue < 0 || numValue > 100) {
                return Promise.reject(new Error('El promedio debe estar entre 0 y 100'));
              }
              return Promise.resolve();
            },
          },
        ],
        placeholder: 'Ej: 85.50',
        min: 0,
        max: 100,
        step: 0.01,
        precision: 2,
        span: 8,
      },
      {
        name: 'fechaEgreso',
        label: 'Fecha de Egreso',
        type: 'datePicker',
        format: 'YYYY-MM-DD',
        disabledDate: (current) => {
          // No permitir fechas futuras
          return current && current > dayjs().endOf('day');
        },
        placeholder: 'Seleccione la fecha de egreso',
        span: 8,
      },
    ],
  },

  // Sección: Documentos
  documents: {
    title: 'Documentos Requeridos',
    fields: [
      {
        name: 'documentoCedulaIdentidad',
        label: 'Cédula de Identidad',
        type: 'checkbox',
        span: 8,
      },
      {
        name: 'documentoCedulaIdentidadFile',
        label: 'Subir Cédula de Identidad',
        type: 'upload',
        span: 16,
        accept: '.pdf,.jpg,.jpeg,.png',
        maxCount: 1,
        uploadText: 'Seleccionar archivo',
      },
      {
        name: 'documentoCertificadoNacimiento',
        label: 'Certificado de Nacimiento',
        type: 'checkbox',
        span: 8,
      },
      {
        name: 'documentoCertificadoNacimientoFile',
        label: 'Subir Certificado de Nacimiento',
        type: 'upload',
        span: 16,
        accept: '.pdf,.jpg,.jpeg,.png',
        maxCount: 1,
        uploadText: 'Seleccionar archivo',
      },
      {
        name: 'documentoDiplomaBachiller',
        label: 'Diploma de Bachiller',
        type: 'checkbox',
        span: 8,
      },
      {
        name: 'documentoDiplomaBachillerFile',
        label: 'Subir Diploma de Bachiller',
        type: 'upload',
        span: 16,
        accept: '.pdf,.jpg,.jpeg,.png',
        maxCount: 1,
        uploadText: 'Seleccionar archivo',
      },
      {
        name: 'documentoPagoMatricula',
        label: 'Pago del Aporte por Matrícula Anual',
        type: 'checkbox',
        rules: [
          {
            validator: (_, value) => {
              if (!value) {
                return Promise.reject(new Error('El documento de pago es requerido'));
              }
              return Promise.resolve();
            }
          }
        ],
        span: 8,
      },
      {
        name: 'documentoPagoMatriculaFile',
        label: 'Subir Comprobante de Pago',
        type: 'upload',
        span: 16,
        accept: '.pdf,.jpg,.jpeg,.png',
        maxCount: 1,
        uploadText: 'Seleccionar archivo',
      },
      {
        name: 'documentoFolderAmarillo',
        label: 'Folder Amarillo con NEPACO',
        type: 'checkbox',
        span: 8,
      },
    ],
  },

  // Sección: Observaciones
  observations: {
    title: 'Observaciones',
    fields: [
      {
        name: 'observaciones',
        label: 'Observaciones Adicionales',
        type: 'textarea',
        placeholder: 'Ingrese observaciones adicionales',
        rows: 4,
        span: 24, // Observaciones mantiene span 24
      },
    ],
  },
};

// Orden de secciones
export const studentFormSections = [
  'personalData',
  'geographicData',
  'contactData',
  'academicData',
  'documents',
  'observations',
];
