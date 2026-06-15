/**
 * Campos ABM carrera — FormField / workspace (config en application).
 */

import {
  CARRERA_IMAGE_ACCEPT,
  CARRERA_IMAGE_FORMATS_HINT,
} from './carreraImageUploadConstants';

const MIN_TEXT = { min: 2, message: 'Mínimo 2 caracteres' };

export const createCarreraFormSections = () => ({
  datosCarrera: {
    title: 'Datos de la carrera',
    description:
      'Código, nombre y datos de identificación. El estado activo se asigna automáticamente al crear.',
    fields: [
      {
        name: 'codigo',
        label: 'Código',
        type: 'input',
        required: true,
        span: 12,
        placeholder: 'Ej. SIS-INF',
        maxLength: 50,
        rules: [MIN_TEXT],
      },
      {
        name: 'nombre',
        label: 'Nombre',
        type: 'input',
        required: true,
        span: 12,
        placeholder: 'Nombre de la carrera',
        maxLength: 255,
        rules: [MIN_TEXT],
      },
      {
        name: 'areaFormacion',
        label: 'Área de formación',
        type: 'input',
        span: 12,
        placeholder: 'Ej. COMERCIAL Y SERVICIOS',
        maxLength: 150,
      },
      {
        name: 'tituloOtorgado',
        label: 'Título otorgado',
        type: 'input',
        span: 12,
        placeholder: 'Título profesional',
        maxLength: 250,
      },
      {
        name: 'imagenRuta',
        type: 'hidden',
        preserve: true,
      },
      {
        name: 'colorHex',
        label: 'Color identificador',
        type: 'color',
        pickerMode: 'popover',
        span: 12,
        helperText: 'Formato #RRGGBB para chips, tablas y dashboards.',
      },
      {
        name: 'imagenArchivo',
        label: 'Imagen de la carrera',
        type: 'imageUpload',
        span: 12,
        previewField: 'imagenRuta',
        accept: CARRERA_IMAGE_ACCEPT,
        formatsHint: CARRERA_IMAGE_FORMATS_HINT,
        previewAlt: 'Vista previa de la imagen de la carrera',
        extra: 'Se guarda en uploads/carreras. El nombre usa el código y la fecha.',
      },
      {
        name: 'descripcion',
        label: 'Descripción',
        type: 'textarea',
        span: 24,
        rows: 4,
        placeholder: 'Perfil profesional (opcional)',
      },
    ],
  },
});

export const CARRERA_FORM_FIELD_NAMES = [
  'codigo',
  'nombre',
  'areaFormacion',
  'tituloOtorgado',
  'colorHex',
  'imagenArchivo',
  'descripcion',
];
