/**
 * Campos ABM materia — FormSection / FormField (config en application).
 */

import {
  CLASIFICACION_MATERIA_OPTIONS,
  TIPOS_MATERIA_OPTIONS,
} from './materiaFormConstants';

const MIN_TEXT = { min: 2, message: 'Mínimo 2 caracteres' };

export const createMateriaFormSections = () => ({
  datosMateria: {
    title: 'Datos de la materia',
    description:
      'Catálogo de materias del instituto. El estado activo se asigna al crear; la activación/desactivación se gestiona desde el listado.',
    fields: [
      {
        name: 'sigla',
        label: 'Sigla',
        type: 'input',
        required: true,
        span: 12,
        placeholder: 'Ej. PRG-102',
        maxLength: 50,
        rules: [MIN_TEXT],
        className: 'cfg-materia-form-sigla',
      },
      {
        name: 'nombre',
        label: 'Nombre',
        type: 'input',
        required: true,
        span: 12,
        placeholder: 'Nombre completo',
        maxLength: 255,
        rules: [MIN_TEXT],
      },
      {
        name: 'tipo',
        label: 'Tipo',
        type: 'pillSelect',
        pillVariant: 'materiaTipo',
        required: true,
        span: 12,
        placeholder: 'Seleccione…',
        options: TIPOS_MATERIA_OPTIONS,
        allowClear: true,
      },
      {
        name: 'clasificacion',
        label: 'Clasificación',
        type: 'pillSelect',
        pillVariant: 'materiaClasificacion',
        span: 12,
        placeholder: 'Seleccione…',
        options: CLASIFICACION_MATERIA_OPTIONS,
        allowClear: true,
      },
      {
        name: 'objetivos',
        label: 'Objetivos / descripción',
        type: 'textarea',
        span: 24,
        rows: 4,
        placeholder: 'Objetivos de aprendizaje (opcional)',
        extra: 'Se guarda en el campo objetivos del catálogo.',
      },
    ],
  },
});

export const MATERIA_FORM_FIELD_NAMES = [
  'sigla',
  'nombre',
  'tipo',
  'clasificacion',
  'objetivos',
];
