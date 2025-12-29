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
        format: 'DD-MM-YYYY', // Formato de visualización: día-mes-año con guiones
        disabledDate: (current) => {
          // No permitir fechas futuras y validar edad mínima (17 años)
          if (current && current > dayjs().endOf('day')) {
            return true;
          }
          // Validar que tenga al menos 17 años
          const minDate = dayjs().subtract(17, 'year');
          return current && current > minDate;
        },
        placeholder: 'DD-MM-YYYY o DD/MM/YYYY',
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
        name: 'estadoCivilId',
        label: 'Estado Civil',
        type: 'select',
        options: 'estadosCiviles', // Referencia a datos del Provider
        placeholder: 'Seleccione el estado civil',
        allowClear: true,
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
    ],
  },

  // Sección: Datos Geográficos y Origen
  geographicData: {
    title: 'Origen y Ubicación Geográfica',
    fields: [
      // Idiomas
      {
        name: 'idiomaPrincipalId',
        label: 'Idioma Principal o Más Hablado',
        type: 'select',
        options: 'idiomas',
        placeholder: 'Seleccione el idioma que más habla o utiliza (ej: Español, Francés, Inglés, etc.)',
        allowClear: true,
        span: 8,
        rules: [
          { required: true, message: 'Debe seleccionar el idioma principal' },
        ],
      },
      {
        name: 'idiomaSecundarioId',
        label: 'Idioma Secundario',
        type: 'select',
        options: 'idiomas',
        placeholder: 'Seleccione el idioma secundario (puede ser el idioma materno si no lo habla frecuentemente)',
        allowClear: true,
        span: 8,
      },
      // Separador entre origen geográfico e idiomas
      {
        name: 'idiomasDivider',
        type: 'divider',
        span: 24,
      },
      {
        name: 'tipoNacionalidad',
        label: 'Nacionalidad',
        type: 'radio',
        options: [
          { label: 'Boliviana', value: 'BOLIVIANA' },
          { label: 'Extranjera', value: 'EXTRANJERA' },
          { label: 'Doble Nacionalidad', value: 'DOBLE_NACIONALIDAD' },
        ],
        rules: [
          { required: true, message: 'Debe seleccionar el tipo de nacionalidad' },
        ],
        span: 24,
      },
      // ============================================
      // CAMPOS PARA EXTRANJEROS (tipoNacionalidad === 'EXTRANJERA')
      // ============================================
      {
        name: 'paisNacimientoId',
        label: 'País de Nacimiento',
        type: 'select',
        options: 'paises',
        placeholder: 'Seleccione el país de nacimiento',
        allowClear: true,
        span: 8,
        dependencies: ['tipoNacionalidad'],
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'EXTRANJERA';
        },
        // Filtrar Bolivia de la lista (solo para extranjeros simples)
        filterOption: (input, option) => {
          // Si el país es Bolivia, no mostrarlo en extranjeros simples
          return option?.label?.toLowerCase().includes(input.toLowerCase());
        },
      },
      {
        name: 'ciudadNacimientoExtranjero',
        label: 'Ciudad de Nacimiento',
        type: 'input',
        rules: [
          { required: true, message: 'La ciudad de nacimiento es requerida' },
          { max: 100, message: 'La ciudad no puede exceder 100 caracteres' },
        ],
        placeholder: 'Ingrese la ciudad de nacimiento',
        span: 8,
        dependencies: ['tipoNacionalidad'],
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'EXTRANJERA';
        },
      },

      // ============================================
      // CAMPOS PARA BOLIVIANOS (tipoNacionalidad === 'BOLIVIANA')
      // ============================================
      {
        name: 'departamentoNacimientoId',
        label: 'Departamento de Nacimiento',
        type: 'select',
        options: 'departamentos',
        placeholder: 'Seleccione el departamento de nacimiento',
        allowClear: true,
        span: 8,
        dependencies: ['tipoNacionalidad'],
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'BOLIVIANA';
        },
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
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'BOLIVIANA';
        },
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
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'BOLIVIANA';
        },
      },
      {
        name: 'ciudadNacimiento',
        label: 'Localidad o Comunidad de Nacimiento',
        type: 'input',
        rules: [
          { max: 100, message: 'La localidad o comunidad no puede exceder 100 caracteres' },
        ],
        placeholder: 'Ingrese la localidad o comunidad de nacimiento (opcional)',
        span: 8,
        dependencies: ['tipoNacionalidad'],
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'BOLIVIANA';
        },
      },

      // ============================================
      // CAMPOS PARA DOBLE NACIONALIDAD - PRIMERA NACIONALIDAD
      // ============================================
      {
        name: 'primeraNacionalidadTipo',
        label: 'Primera Nacionalidad',
        type: 'radio',
        options: [
          { label: 'Extranjera', value: 'EXTRANJERA' },
          { label: 'Boliviana', value: 'BOLIVIANA' },
        ],
        rules: [
          { required: true, message: 'Debe seleccionar el tipo de primera nacionalidad' },
        ],
        span: 8,
        dependencies: ['tipoNacionalidad'],
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'DOBLE_NACIONALIDAD';
        },
      },
      // Primera nacionalidad - Extranjera
      {
        name: 'primeraNacionalidadPaisId',
        label: 'País de la Primera Nacionalidad',
        type: 'select',
        options: 'paises',
        placeholder: 'Seleccione el país de la primera nacionalidad',
        allowClear: true,
        span: 8,
        dependencies: ['tipoNacionalidad', 'primeraNacionalidadTipo'],
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'DOBLE_NACIONALIDAD' &&
            formValues?.primeraNacionalidadTipo === 'EXTRANJERA';
        },
      },
      {
        name: 'primeraNacionalidadCiudad',
        label: 'Ciudad de la Primera Nacionalidad',
        type: 'input',
        rules: [
          { required: true, message: 'La ciudad es requerida' },
          { max: 100, message: 'La ciudad no puede exceder 100 caracteres' },
        ],
        placeholder: 'Ingrese la ciudad de la primera nacionalidad',
        span: 8,
        dependencies: ['tipoNacionalidad', 'primeraNacionalidadTipo'],
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'DOBLE_NACIONALIDAD' &&
            formValues?.primeraNacionalidadTipo === 'EXTRANJERA';
        },
      },
      // Primera nacionalidad - Boliviana
      {
        name: 'primeraNacionalidadDepartamentoId',
        label: 'Departamento (Primera Nacionalidad)',
        type: 'select',
        options: 'departamentos',
        placeholder: 'Seleccione el departamento',
        allowClear: true,
        span: 8,
        dependencies: ['tipoNacionalidad', 'primeraNacionalidadTipo'],
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'DOBLE_NACIONALIDAD' &&
            formValues?.primeraNacionalidadTipo === 'BOLIVIANA';
        },
      },
      {
        name: 'primeraNacionalidadProvinciaId',
        label: 'Provincia (Primera Nacionalidad)',
        type: 'select',
        options: 'provincias',
        placeholder: 'Seleccione la provincia',
        allowClear: true,
        span: 8,
        dependencies: ['tipoNacionalidad', 'primeraNacionalidadTipo', 'primeraNacionalidadDepartamentoId'],
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'DOBLE_NACIONALIDAD' &&
            formValues?.primeraNacionalidadTipo === 'BOLIVIANA';
        },
      },
      {
        name: 'primeraNacionalidadMunicipioId',
        label: 'Municipio (Primera Nacionalidad)',
        type: 'select',
        options: 'municipios',
        placeholder: 'Seleccione el municipio',
        allowClear: true,
        span: 8,
        dependencies: ['tipoNacionalidad', 'primeraNacionalidadTipo', 'primeraNacionalidadProvinciaId'],
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'DOBLE_NACIONALIDAD' &&
            formValues?.primeraNacionalidadTipo === 'BOLIVIANA';
        },
      },
      {
        name: 'primeraNacionalidadLocalidad',
        label: 'Localidad o Comunidad (Primera Nacionalidad)',
        type: 'input',
        rules: [
          { max: 100, message: 'La localidad no puede exceder 100 caracteres' },
        ],
        placeholder: 'Ingrese la localidad o comunidad (opcional)',
        span: 8,
        dependencies: ['tipoNacionalidad', 'primeraNacionalidadTipo'],
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'DOBLE_NACIONALIDAD' &&
            formValues?.primeraNacionalidadTipo === 'BOLIVIANA';
        },
      },

      // ============================================
      // CAMPOS PARA DOBLE NACIONALIDAD - SEGUNDA NACIONALIDAD
      // ============================================
      {
        name: 'segundaNacionalidadTipo',
        label: 'Segunda Nacionalidad',
        type: 'radio',
        options: [
          { label: 'Extranjera', value: 'EXTRANJERA' },
          { label: 'Boliviana', value: 'BOLIVIANA' },
        ],
        rules: [
          { required: true, message: 'Debe seleccionar el tipo de segunda nacionalidad' },
        ],
        span: 8,
        dependencies: ['tipoNacionalidad', 'primeraNacionalidadTipo'],
        // La segunda nacionalidad siempre está deshabilitada (se establece automáticamente como el contrario de la primera)
        disabled: true,
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'DOBLE_NACIONALIDAD';
        },
      },
      // Segunda nacionalidad - Extranjera
      {
        name: 'segundaNacionalidadPaisId',
        label: 'País de la Segunda Nacionalidad',
        type: 'select',
        options: 'paises',
        placeholder: 'Seleccione el país de la segunda nacionalidad',
        allowClear: true,
        span: 8,
        dependencies: ['tipoNacionalidad', 'segundaNacionalidadTipo', 'primeraNacionalidadPaisId'],
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'DOBLE_NACIONALIDAD' &&
            formValues?.segundaNacionalidadTipo === 'EXTRANJERA';
        },
      },
      {
        name: 'segundaNacionalidadCiudad',
        label: 'Ciudad de la Segunda Nacionalidad',
        type: 'input',
        rules: [
          { required: true, message: 'La ciudad es requerida' },
          { max: 100, message: 'La ciudad no puede exceder 100 caracteres' },
        ],
        placeholder: 'Ingrese la ciudad de la segunda nacionalidad',
        span: 8,
        dependencies: ['tipoNacionalidad', 'segundaNacionalidadTipo'],
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'DOBLE_NACIONALIDAD' &&
            formValues?.segundaNacionalidadTipo === 'EXTRANJERA';
        },
      },
      // Segunda nacionalidad - Boliviana
      {
        name: 'segundaNacionalidadDepartamentoId',
        label: 'Departamento (Segunda Nacionalidad)',
        type: 'select',
        options: 'departamentos',
        placeholder: 'Seleccione el departamento',
        allowClear: true,
        span: 8,
        dependencies: ['tipoNacionalidad', 'segundaNacionalidadTipo'],
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'DOBLE_NACIONALIDAD' &&
            formValues?.segundaNacionalidadTipo === 'BOLIVIANA';
        },
      },
      {
        name: 'segundaNacionalidadProvinciaId',
        label: 'Provincia (Segunda Nacionalidad)',
        type: 'select',
        options: 'provincias',
        placeholder: 'Seleccione la provincia',
        allowClear: true,
        span: 8,
        dependencies: ['tipoNacionalidad', 'segundaNacionalidadTipo', 'segundaNacionalidadDepartamentoId'],
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'DOBLE_NACIONALIDAD' &&
            formValues?.segundaNacionalidadTipo === 'BOLIVIANA';
        },
      },
      {
        name: 'segundaNacionalidadMunicipioId',
        label: 'Municipio (Segunda Nacionalidad)',
        type: 'select',
        options: 'municipios',
        placeholder: 'Seleccione el municipio',
        allowClear: true,
        span: 8,
        dependencies: ['tipoNacionalidad', 'segundaNacionalidadTipo', 'segundaNacionalidadProvinciaId'],
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'DOBLE_NACIONALIDAD' &&
            formValues?.segundaNacionalidadTipo === 'BOLIVIANA';
        },
      },
      {
        name: 'segundaNacionalidadLocalidad',
        label: 'Localidad o Comunidad (Segunda Nacionalidad)',
        type: 'input',
        rules: [
          { max: 100, message: 'La localidad no puede exceder 100 caracteres' },
        ],
        placeholder: 'Ingrese la localidad o comunidad (opcional)',
        span: 8,
        dependencies: ['tipoNacionalidad', 'segundaNacionalidadTipo'],
        shouldRender: (formValues) => {
          return formValues?.tipoNacionalidad === 'DOBLE_NACIONALIDAD' &&
            formValues?.segundaNacionalidadTipo === 'BOLIVIANA';
        },
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

  // Sección: Datos de Discapacidad
  disabilityData: {
    title: 'Datos de Discapacidad',
    fields: [
      {
        name: 'tipoDiscapacidadId',
        label: 'Tipo de Discapacidad',
        type: 'select',
        options: 'tiposDiscapacidad',
        rules: [
          { required: true, message: 'El tipo de discapacidad es requerido' },
        ],
        placeholder: 'Seleccione el tipo de discapacidad',
        allowClear: true,
        span: 8,
      },
      {
        name: 'gradoInvalidez',
        label: 'Grado de Invalidez',
        type: 'radio',
        options: [
          { label: 'Leve', value: 'LEVE' },
          { label: 'Moderado', value: 'MODERADO' },
          { label: 'Severo', value: 'SEVERO' },
          { label: 'Profundo', value: 'PROFUNDO' },
        ],
        span: 16,
      },
      {
        name: 'causa',
        label: 'Causa de la Discapacidad',
        type: 'textarea',
        placeholder: 'Ej: Congénito, Adquirido, Accidente, Enfermedad, Por diabetes, etc.',
        rows: 4,
        span: 8,
      },
      {
        name: 'detallesDiscapacidad',
        label: 'Descripción Detallada de la Discapacidad',
        type: 'textarea',
        rules: [
          { required: true, message: 'La descripción de la discapacidad es requerida' },
        ],
        placeholder: 'Proporcione información detallada sobre la discapacidad: subtipo específico, limitaciones, necesidades especiales, etc. Si tiene múltiples discapacidades, describa cada una.',
        rows: 4,
        span: 16,
      },
    ],
  },

  // Sección: Contactos de Emergencia
  emergencyContacts: {
    title: 'Contactos de Emergencia',
    fields: [
      {
        name: 'contactosEmergencia',
        label: '', // Sin label porque el título de la sección ya lo muestra
        type: 'formList',
        description: 'Puede agregar uno o más contactos de emergencia (opcional).',
        minItems: 0,
        span: 24, // Ocupar todo el ancho
        itemFields: [
          {
            name: 'tipoParentescoId',
            label: 'Tipo de Parentesco',
            type: 'select',
            options: 'tiposParentesco',
            rules: [
              { required: true, message: 'El tipo de parentesco es requerido' },
            ],
            placeholder: 'Seleccione el tipo de parentesco',
            span: 12,
          },
          {
            name: 'nombres',
            label: 'Nombres',
            type: 'input',
            rules: [
              { required: true, message: 'Los nombres son requeridos' },
              { max: 150, message: 'Los nombres no pueden exceder 150 caracteres' },
            ],
            placeholder: 'Ingrese los nombres completos',
            span: 12,
          },
          {
            name: 'apellidos',
            label: 'Apellidos',
            type: 'input',
            rules: [
              { max: 150, message: 'Los apellidos no pueden exceder 150 caracteres' },
            ],
            placeholder: 'Ingrese los apellidos',
            span: 12,
          },
          {
            name: 'ci',
            label: 'CI',
            type: 'input',
            rules: [
              { max: 20, message: 'El CI no puede exceder 20 caracteres' },
            ],
            placeholder: 'Ej: 12345678',
            span: 12,
          },
          {
            name: 'telefono',
            label: 'Teléfono',
            type: 'input',
            rules: [
              { max: 20, message: 'El teléfono no puede exceder 20 caracteres' },
            ],
            placeholder: 'Ej: 4-1234567',
            span: 12,
          },
          {
            name: 'celular',
            label: 'Celular',
            type: 'input',
            rules: [
              { required: true, message: 'El celular es requerido' },
              { max: 20, message: 'El celular no puede exceder 20 caracteres' },
            ],
            placeholder: 'Ej: 70012345',
            span: 12,
          },
          {
            name: 'email',
            label: 'Email',
            type: 'input',
            rules: [
              { type: 'email', message: 'Ingrese un email válido' },
              { max: 150, message: 'El email no puede exceder 150 caracteres' },
            ],
            placeholder: 'Ej: contacto@email.com',
            span: 12,
          },
          {
            name: 'direccion',
            label: 'Dirección',
            type: 'textarea',
            rules: [
              { max: 500, message: 'La dirección no puede exceder 500 caracteres' },
            ],
            placeholder: 'Ingrese la dirección de domicilio',
            rows: 2,
            span: 24,
          },
          {
            name: 'ocupacion',
            label: 'Ocupación',
            type: 'input',
            rules: [
              { max: 100, message: 'La ocupación no puede exceder 100 caracteres' },
            ],
            placeholder: 'Ej: Profesor, Comerciante, etc.',
            span: 12,
          },
          {
            name: 'lugarTrabajo',
            label: 'Lugar de Trabajo',
            type: 'input',
            rules: [
              { max: 200, message: 'El lugar de trabajo no puede exceder 200 caracteres' },
            ],
            placeholder: 'Ej: Colegio San José',
            span: 12,
          },
          {
            name: 'esContactoEmergencia',
            label: 'Es Contacto de Emergencia',
            type: 'switch',
            defaultValue: true,
            span: 6,
          },
          {
            name: 'esApoderadoLegal',
            label: 'Es Apoderado Legal',
            type: 'switch',
            defaultValue: false,
            span: 6,
          },
          {
            name: 'viveConEstudiante',
            label: 'Vive con el Estudiante',
            type: 'switch',
            defaultValue: false,
            span: 6,
          },
          {
            name: 'observaciones',
            label: 'Observaciones',
            type: 'textarea',
            rules: [
              { max: 500, message: 'Las observaciones no pueden exceder 500 caracteres' },
            ],
            placeholder: 'Observaciones adicionales sobre este contacto',
            rows: 2,
            span: 24,
          },
        ],
        minItems: 1,
        maxItems: 10,
        addButtonText: 'Agregar Contacto',
        removeButtonText: 'Eliminar',
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
  'emergencyContacts',
  'documents',
  'observations',
];
