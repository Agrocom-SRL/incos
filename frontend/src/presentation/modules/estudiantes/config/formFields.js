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
        name: 'nacionalidad',
        label: 'Nacionalidad',
        type: 'input',
        placeholder: 'Ej: Boliviana',
        span: 8,
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
        span: 12,
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
        span: 12,
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
        span: 12,
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
        span: 12,
      },
      {
        name: 'direccion',
        label: 'Dirección',
        type: 'textarea',
        placeholder: 'Ingrese la dirección completa',
        rows: 2,
        span: 12,
      },
      {
        name: 'zona',
        label: 'Zona',
        type: 'input',
        rules: [
          { max: 100, message: 'La zona no puede exceder 100 caracteres' },
        ],
        placeholder: 'Ingrese la zona/barrio',
        span: 12,
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
        span: 24,
      },
    ],
  },
};

// Orden de secciones
export const studentFormSections = [
  'personalData',
  'contactData',
  'observations',
];
