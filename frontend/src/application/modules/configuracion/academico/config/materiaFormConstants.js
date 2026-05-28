/** Opciones de formulario materia — alineadas con backend TIPOS_MATERIA y seed 13 */

export const TIPOS_MATERIA_OPTIONS = [
  { value: 'TEORICA', label: 'Teórica' },
  { value: 'PRACTICA', label: 'Práctica' },
  { value: 'TEORICA_PRACTICA', label: 'Teórica–práctica' },
];

export const TIPO_MATERIA_TAG_COLOR = {
  TEORICA: 'blue',
  PRACTICA: 'success',
  TEORICA_PRACTICA: 'processing',
};

export const TIPO_MATERIA_LABEL = {
  TEORICA: 'Teórica',
  PRACTICA: 'Práctica',
  TEORICA_PRACTICA: 'Teórica–práctica',
};

/** Clasificaciones frecuentes del catálogo (el usuario puede escribir otra) */
export const CLASIFICACION_MATERIA_OPTIONS = [
  'MATEMÁTICA',
  'PROGRAMACIÓN',
  'IDIOMAS',
  'CONTABILIDAD',
  'ADMINISTRACIÓN',
  'FORMACIÓN GENERAL',
  'HARDWARE',
  'REDES',
  'BASE DE DATOS',
  'EMPRENDIMIENTO',
].map((v) => ({ value: v, label: v }));
